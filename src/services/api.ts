import axios from 'axios';
import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  Notification, 
  Report, 
  ReportFilter 
} from '../types';

const API_URL = import.meta.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to decode JWT payload locally without external dependencies
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Request Interceptor: Attach JWT to headers
api.interceptors.request.use(
  (config) => {
    const token = apiService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 and redirect to Login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      apiService.clearToken();
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// MOCK DATA STORAGE (Fallback when backend is not running)
const MOCK_USERS_KEY = 'mock_users';
const MOCK_REPORTS_KEY = 'mock_reports';
const MOCK_NOTIFICATIONS_KEY = 'mock_notifications';

const initMockDb = () => {
  let users = [];
  const rawUsers = localStorage.getItem(MOCK_USERS_KEY);
  if (rawUsers) {
    try {
      users = JSON.parse(rawUsers);
    } catch {
      users = [];
    }
  }

  // Ensure default demo user exists
  if (!users.some((u: any) => u.correo === 'user@demo.com')) {
    users.push({
      id: 'usr_1',
      nombre: 'Usuario Demo',
      correo: 'user@demo.com',
      telefono: '123456789',
      rol: 'usuario',
      createdAt: new Date().toISOString(),
      contrasena: 'Demo123'
    });
  }

  // Ensure admin user exists
  if (!users.some((u: any) => u.correo === 'admin@sanosysalvos.cl')) {
    users.push({
      id: 'usr_admin',
      nombre: 'Administrador Sanos y Salvos',
      correo: 'admin@sanosysalvos.cl',
      telefono: '999999999',
      rol: 'administrador',
      createdAt: new Date().toISOString(),
      contrasena: 'admin123'
    });
  }

  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

  if (!localStorage.getItem(MOCK_REPORTS_KEY)) {
    localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(MOCK_NOTIFICATIONS_KEY)) {
    const defaultNotifications: Notification[] = [
      {
        id: 'not_1',
        usuarioId: 'usr_1',
        titulo: '¡Bienvenido a la Plataforma!',
        descripcion: 'Explora tu dashboard, gestiona tu rol y genera reportes analíticos.',
        tipo: 'success',
        leida: false,
        createdAt: new Date().toISOString(),
        sincronizado: true,
      },
      {
        id: 'not_2',
        usuarioId: 'usr_1',
        titulo: 'Perfil Incompleto',
        descripcion: 'Puedes solicitar un cambio de rol subiendo tu documentación.',
        tipo: 'info',
        leida: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        sincronizado: true,
      }
    ];
    localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(defaultNotifications));
  }
};

initMockDb();

// Helper to generate a fake JWT containing user details
const generateFakeJwt = (user: User): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
  }));
  return `${header}.${payload}.signature`;
};

// Check if error is a network error (backend down)
const isNetworkError = (error: any): boolean => {
  return !error.response && error.code !== 'ECONNABORTED';
};

export const apiService = {
  // Token Management
  setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  },

  clearToken(): void {
    localStorage.removeItem('jwt_token');
  },

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const decoded = parseJwt(token);
    if (!decoded) return false;
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  },

  getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded = parseJwt(token);
    if (!decoded) return null;
    
    // Find detailed user info in mock storage or return parsed token payload
    const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    const user = users.find((u: any) => u.id === decoded.id || u.correo === decoded.correo);
    if (user) {
      const { contrasena, ...safeUser } = user;
      return safeUser as User;
    }

    return {
      id: decoded.id || decoded.sub || 'unknown',
      nombre: decoded.nombre || 'Usuario',
      correo: decoded.correo || '',
      telefono: decoded.telefono || '',
      rol: decoded.rol || 'usuario',
      createdAt: decoded.createdAt || new Date().toISOString(),
    };
  },

  // Auth Methods
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>('/auth/registro', data);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        // Mock register logic
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        if (users.some((u: any) => u.correo === data.correo)) {
          throw new Error('El correo ya está registrado');
        }
        const newUser: User = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          nombre: data.nombre,
          correo: data.correo,
          telefono: data.telefono,
          rol: 'usuario',
          createdAt: new Date().toISOString(),
        };
        users.push({ ...newUser, contrasena: data.contrasena });
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

        // Create initial registration notification
        const notifications = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || '[]');
        notifications.push({
          id: 'not_' + Math.random().toString(36).substr(2, 9),
          usuarioId: newUser.id,
          titulo: 'Registro Exitoso',
          descripcion: `¡Hola ${newUser.nombre}! Tu cuenta ha sido creada con éxito.`,
          tipo: 'success',
          leida: false,
          createdAt: new Date().toISOString(),
          sincronizado: false
        });
        localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(notifications));

        const token = generateFakeJwt(newUser);
        return { token, user: newUser };
      }
      if (err.response && err.response.status === 400 && err.response.data?.message?.includes('registrado')) {
        throw new Error('El correo ya está registrado');
      }
      throw new Error(err.response?.data?.message || 'Error en el servidor al registrar el usuario');
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>('/auth/login', data);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        // Mock login logic
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        const userExists = users.find((u: any) => u.correo === data.correo);
        if (!userExists) {
          throw new Error('Usuario no registrado');
        }
        const user = users.find((u: any) => u.correo === data.correo && u.contrasena === data.contrasena);
        if (!user) {
          throw new Error('Contraseña incorrecta');
        }
        const { contrasena, ...safeUser } = user;
        const token = generateFakeJwt(safeUser);
        return { token, user: safeUser };
      }
      if (err.response) {
        if (err.response.status === 404 || (err.response.data && err.response.data.message && err.response.data.message.includes('no registrado'))) {
          throw new Error('Usuario no registrado');
        }
        if (err.response.status === 401 || err.response.status === 400) {
          throw new Error('Contraseña incorrecta');
        }
      }
      throw new Error(err.response?.data?.message || 'Error en el servidor al iniciar sesión');
    }
  },

  async logout(): Promise<void> {
    this.clearToken();
  },

  // Users Methods
  async getUserByEmail(correo: string): Promise<User> {
    try {
      const res = await api.get<User>(`/usuarios/correo/${correo}`);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        const user = users.find((u: any) => u.correo === correo);
        if (!user) throw new Error('Usuario no encontrado');
        const { contrasena, ...safeUser } = user;
        return safeUser;
      }
      throw new Error(err.response?.data?.message || 'Error al obtener usuario');
    }
  },

  async getUserProfile(): Promise<User> {
    try {
      const res = await api.get<User>('/usuarios/perfil');
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const user = this.getUserFromToken();
        if (!user) throw new Error('No autenticado');
        return user;
      }
      throw new Error(err.response?.data?.message || 'Error al obtener perfil');
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const res = await api.get<User[]>('/usuarios');
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        return users.map(({ contrasena, ...safeUser }: any) => safeUser as User);
      }
      throw new Error(err.response?.data?.message || 'Error al obtener usuarios');
    }
  },

  async requestRoleChange(data: { rol: 'usuario' | 'municipalidad' | 'refugio' | 'veterinaria' | 'administrador'; documentoValidacion: string }): Promise<User> {
    try {
      const res = await api.post<User>('/usuarios/solicitar-rol', data);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const currentUser = this.getUserFromToken();
        if (!currentUser) throw new Error('No autenticado');
        
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        const index = users.findIndex((u: any) => u.id === currentUser.id);
        if (index !== -1) {
          // Keep current role, save pending request details
          users[index].solicitudRol = {
            rol: data.rol,
            documentoValidacion: data.documentoValidacion,
            estado: 'pendiente',
            fecha: new Date().toISOString()
          };
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

          // Generate notifications
          const notifications = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || '[]');
          
          // User notification
          notifications.push({
            id: 'not_' + Math.random().toString(36).substr(2, 9),
            usuarioId: currentUser.id,
            titulo: 'Solicitud de Cambio de Rol Enviada',
            descripcion: `Tu solicitud para cambiar a rol "${data.rol}" ha sido enviada y está en espera de aprobación.`,
            tipo: 'info',
            leida: false,
            createdAt: new Date().toISOString(),
            sincronizado: false
          });

          // Admin notification
          notifications.push({
            id: 'not_' + Math.random().toString(36).substr(2, 9),
            usuarioId: 'usr_admin', // Admin user ID
            titulo: 'Nueva Solicitud de Cambio de Rol',
            descripcion: `El usuario ${currentUser.nombre} (${currentUser.correo}) ha solicitado cambiar su rol a "${data.rol}".`,
            tipo: 'info',
            leida: false,
            createdAt: new Date().toISOString(),
            sincronizado: false,
            datos: {
              tipo: 'role_request',
              requestId: 'req_' + Math.random().toString(36).substr(2, 9),
              usuarioId: currentUser.id,
              usuarioNombre: currentUser.nombre,
              usuarioCorreo: currentUser.correo,
              rolSolicitado: data.rol,
              documentoValidacion: data.documentoValidacion,
              estado: 'pendiente'
            }
          });
          localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(notifications));

          const { contrasena, ...safeUser } = users[index];
          return safeUser;
        }
        throw new Error('Usuario no encontrado');
      }
      throw new Error(err.response?.data?.message || 'Error al solicitar cambio de rol');
    }
  },

  async approveRoleChange(requestId: string, notificationId: string): Promise<void> {
    try {
      await api.post(`/admin/aprobar-rol/${requestId}`);
    } catch (err: any) {
      if (isNetworkError(err)) {
        const notifications = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || '[]');
        const notifIndex = notifications.findIndex((n: any) => n.id === notificationId);
        if (notifIndex === -1) throw new Error('Notificación no encontrada');

        const requestData = notifications[notifIndex].datos;
        if (!requestData || requestData.estado !== 'pendiente') {
          throw new Error('La solicitud no está pendiente');
        }

        // 1. Update request status in notification
        requestData.estado = 'aprobado';
        notifications[notifIndex].datos = requestData;
        notifications[notifIndex].leida = true;
        notifications[notifIndex].descripcion = `Aprobaste el cambio de rol a ${requestData.rolSolicitado} para ${requestData.usuarioNombre}.`;
        
        // 2. Update user's role in mock database
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        const userIndex = users.findIndex((u: any) => u.id === requestData.usuarioId);
        if (userIndex !== -1) {
          users[userIndex].rol = requestData.rolSolicitado;
          users[userIndex].documentoValidacion = requestData.documentoValidacion;
          if (users[userIndex].solicitudRol) {
            users[userIndex].solicitudRol.estado = 'aprobado';
          }
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
        }

        // 3. Create notification for the user to inform them about approval
        notifications.push({
          id: 'not_' + Math.random().toString(36).substr(2, 9),
          usuarioId: requestData.usuarioId,
          titulo: 'Solicitud de Rol Aprobada',
          descripcion: `Tu solicitud de cambio de rol a "${requestData.rolSolicitado}" ha sido aprobada por el administrador.`,
          tipo: 'success',
          leida: false,
          createdAt: new Date().toISOString(),
          sincronizado: false
        });

        localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(notifications));
        return;
      }
      throw new Error(err.response?.data?.message || 'Error al aprobar cambio de rol');
    }
  },

  async rejectRoleChange(requestId: string, notificationId: string): Promise<void> {
    try {
      await api.post(`/admin/rechazar-rol/${requestId}`);
    } catch (err: any) {
      if (isNetworkError(err)) {
        const notifications = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || '[]');
        const notifIndex = notifications.findIndex((n: any) => n.id === notificationId);
        if (notifIndex === -1) throw new Error('Notificación no encontrada');

        const requestData = notifications[notifIndex].datos;
        if (!requestData || requestData.estado !== 'pendiente') {
          throw new Error('La solicitud no está pendiente');
        }

        // 1. Update request status in notification
        requestData.estado = 'rechazado';
        notifications[notifIndex].datos = requestData;
        notifications[notifIndex].leida = true;
        notifications[notifIndex].descripcion = `Rechazaste el cambio de rol a ${requestData.rolSolicitado} para ${requestData.usuarioNombre}.`;

        // 2. Update request status in mock database user
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        const userIndex = users.findIndex((u: any) => u.id === requestData.usuarioId);
        if (userIndex !== -1) {
          if (users[userIndex].solicitudRol) {
            users[userIndex].solicitudRol.estado = 'rechazado';
          }
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
        }

        // 3. Create notification for the user to inform them about rejection
        notifications.push({
          id: 'not_' + Math.random().toString(36).substr(2, 9),
          usuarioId: requestData.usuarioId,
          titulo: 'Solicitud de Rol Rechazada',
          descripcion: `Tu solicitud de cambio de rol a "${requestData.rolSolicitado}" ha sido rechazada por el administrador.`,
          tipo: 'error',
          leida: false,
          createdAt: new Date().toISOString(),
          sincronizado: false
        });

        localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(notifications));
        return;
      }
      throw new Error(err.response?.data?.message || 'Error al rechazar cambio de rol');
    }
  },

  // Notifications Methods
  async getNotifications(): Promise<Notification[]> {
    try {
      const res = await api.get<Notification[]>('/notificaciones');
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const currentUser = this.getUserFromToken();
        const notifications = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || '[]');
        if (!currentUser) return [];
        return notifications.filter((n: any) => n.usuarioId === currentUser.id);
      }
      throw new Error(err.response?.data?.message || 'Error al cargar notificaciones');
    }
  },

  async markNotificationAsRead(id: string): Promise<Notification> {
    try {
      const res = await api.patch<Notification>(`/notificaciones/${id}/leida`);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const notifications = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || '[]');
        const index = notifications.findIndex((n: any) => n.id === id);
        if (index !== -1) {
          notifications[index].leida = true;
          localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(notifications));
          return notifications[index];
        }
        throw new Error('Notificación no encontrada');
      }
      throw new Error(err.response?.data?.message || 'Error al marcar notificación como leída');
    }
  },

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      // If server doesn't support bulk, we can try to call for each or custom endpoint
      // We will loop through unread ones and mark them
      const notifications = await this.getNotifications();
      const unread = notifications.filter(n => !n.leida);
      await Promise.all(unread.map(n => api.patch(`/notificaciones/${n.id}/leida`)));
    } catch (err: any) {
      if (isNetworkError(err)) {
        const currentUser = this.getUserFromToken();
        if (!currentUser) return;
        const notifications = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || '[]');
        const updated = notifications.map((n: any) => {
          if (n.usuarioId === currentUser.id) {
            return { ...n, leida: true };
          }
          return n;
        });
        localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(updated));
        return;
      }
      throw new Error(err.response?.data?.message || 'Error al marcar todas las notificaciones como leídas');
    }
  },

  // Reports Methods
  async generateReport(filter: ReportFilter): Promise<Report> {
    try {
      const res = await api.post<Report>('/reportes/generar', filter);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const currentUser = this.getUserFromToken();
        if (!currentUser) throw new Error('No autenticado');
        const reports = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY) || '[]');
        const newReport: Report = {
          id: 'rep_' + Math.random().toString(36).substr(2, 9),
          usuarioId: currentUser.id,
          tipo: filter.tipo,
          estado: 'procesando',
          fechaInicio: filter.fechaInicio,
          fechaFin: filter.fechaFin,
          createdAt: new Date().toISOString(),
        };
        reports.push(newReport);
        localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify(reports));

        // Simulate report completion in background
        setTimeout(() => {
          const repDb = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY) || '[]');
          const repIdx = repDb.findIndex((r: any) => r.id === newReport.id);
          if (repIdx !== -1) {
            repDb[repIdx].estado = 'completado';
            repDb[repIdx].urlDescarga = `${API_URL}/reportes/${newReport.id}/descargar`;
            localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify(repDb));

            // Trigger notification
            const notDb = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || '[]');
            notDb.push({
              id: 'not_' + Math.random().toString(36).substr(2, 9),
              usuarioId: currentUser.id,
              titulo: 'Reporte Completado',
              descripcion: `Tu reporte de tipo ${filter.tipo} para el período ${filter.fechaInicio} a ${filter.fechaFin} está listo.`,
              tipo: 'success',
              leida: false,
              createdAt: new Date().toISOString(),
              sincronizado: false
            });
            localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(notDb));
          }
        }, 15000); // changes to completed after 15s (giving time to test the 10s poll)

        return newReport;
      }
      throw new Error(err.response?.data?.message || 'Error al generar reporte');
    }
  },

  async getReports(): Promise<Report[]> {
    try {
      const res = await api.get<Report[]>('/reportes');
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const currentUser = this.getUserFromToken();
        if (!currentUser) return [];
        const reports = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY) || '[]');
        if (currentUser.rol === 'administrador') {
          return reports;
        }
        return reports.filter((r: any) => r.usuarioId === currentUser.id);
      }
      throw new Error(err.response?.data?.message || 'Error al obtener reportes');
    }
  },

  async downloadReport(reportId: string): Promise<Blob> {
    try {
      const res = await api.get(`/reportes/${reportId}/descargar`, {
        responseType: 'blob',
      });
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        // Generate mock CSV data
        const reports = JSON.parse(localStorage.getItem(MOCK_REPORTS_KEY) || '[]');
        const report = reports.find((r: any) => r.id === reportId);
        const reportType = report ? report.tipo : 'general';
        const csvContent = `ID Reporte,Tipo,Fecha Inicio,Fecha Fin,Estado,Creado En\n${reportId},${reportType},${report?.fechaInicio || ''},${report?.fechaFin || ''},completado,${report?.createdAt || ''}\n`;
        return new Blob([csvContent], { type: 'text/csv' });
      }
      throw new Error(err.response?.data?.message || 'Error al descargar reporte');
    }
  }
};
export default api;
