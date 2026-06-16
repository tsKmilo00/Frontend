// User
export interface User {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  rol: 'usuario' | 'municipalidad' | 'refugio' | 'veterinaria' | 'administrador';
  documentoValidacion?: string;
  createdAt: string;
}

// Auth
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface RegisterRequest {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono: string;
}

// Notifications
export interface Notification {
  id: string;
  usuarioId: string;
  titulo: string;
  descripcion: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  leida: boolean;
  createdAt: string;
  datos?: Record<string, unknown>;
  sincronizado?: boolean; // CA 4: "Implementar campo 'sincronizado' en almacenamiento local"
}

// Reports
export interface Report {
  id: string;
  usuarioId: string;
  tipo: 'usuarios' | 'coincidencias' | 'general';
  estado: 'procesando' | 'completado' | 'error';
  fechaInicio: string;
  fechaFin: string;
  urlDescarga?: string;
  createdAt: string;
}

export interface ReportFilter {
  tipo: 'usuarios' | 'coincidencias' | 'general';
  fechaInicio: string;
  fechaFin: string;
}
