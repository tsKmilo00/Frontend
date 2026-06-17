import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { apiService } from '../services/api';
import { User, Report } from '../types';
import Spinner from '../components/Spinner';

// Setup custom marker icon using CDN to avoid Vite bundler hashing issues
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { notifications, approveRoleChange, rejectRoleChange } = useNotifications();

  // Admin states
  const [usersList, setUsersList] = useState<User[]>([]);
  const [reportsList, setReportsList] = useState<Report[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadAdminData = async () => {
      setIsLoadingAdmin(true);
      try {
        const u = await apiService.getAllUsers();
        const r = await apiService.getReports();
        setUsersList(u);
        setReportsList(r);
      } catch (err) {
        console.error('Error al cargar datos de administrador:', err);
      } finally {
        setIsLoadingAdmin(false);
      }
    };
    loadAdminData();
  }, [notifications]); // Reload lists if notifications update (role change approvals)

  if (!user) return null;

  // Handles approving/rejecting role changes with list refresh
  const handleApprove = async (requestId: string, notificationId: string) => {
    if (approveRoleChange) {
      try {
        await approveRoleChange(requestId, notificationId);
        const u = await apiService.getAllUsers();
        setUsersList(u);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReject = async (requestId: string, notificationId: string) => {
    if (rejectRoleChange) {
      try {
        await rejectRoleChange(requestId, notificationId);
        const u = await apiService.getAllUsers();
        setUsersList(u);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDownload = async (reportId: string) => {
    setDownloadingId(reportId);
    try {
      const blob = await apiService.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${reportId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar reporte:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Santiago, Chile coordinates (for Admin view of Sanos y Salvos)
  const santiagoCenter: [number, number] = [-33.4489, -70.6693];
  const santiagoMarkers = [
    { pos: [-33.4489, -70.6693] as [number, number], title: 'Sede Central Sanos y Salvos', desc: 'Punto de control principal del administrador.' },
    { pos: [-33.4310, -70.6120] as [number, number], title: 'Refugio Providencia (Pendiente Acreditación)', desc: 'Solicitud de rol refugio bajo revisión de documentos.' },
    { pos: [-33.5120, -70.7580] as [number, number], title: 'Reporte Incidente #412 (Maipú)', desc: 'Alerta activa de perro herido reportada por la comunidad.' },
    { pos: [-33.4110, -70.5740] as [number, number], title: 'Veterinaria Las Condes (Aliado)', desc: 'Campaña de vacunación y esterilización programada.' },
    { pos: [-33.5220, -70.5980] as [number, number], title: 'Reporte Incidente #105 (La Florida)', desc: 'Alerta de gato extraviado en búsqueda activa.' }
  ];

  // Filter pending role requests from notifications
  const pendingRequests = notifications.filter(
    n => n.datos?.tipo === 'role_request' && n.datos?.estado === 'pendiente'
  );

  // Users metrics calculation
  const totalUsers = usersList.length;
  const countByRole = (role: string) => usersList.filter(u => u.rol === role).length;
  const userPercent = (role: string) => totalUsers > 0 ? Math.round((countByRole(role) / totalUsers) * 100) : 0;

  return (
    <div className="container py-4">
      {/* Welcome Header */}
      <div className="bg-dark text-white rounded-4 p-4 p-md-5 mb-4 shadow-lg relative overflow-hidden bg-page-gradient border border-dark">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-danger text-uppercase fw-semibold mb-2" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
              Panel de Control de Administrador 🛡️ (Página Protegida Exclusiva)
            </span>
            <h1 className="display-6 fw-bold mb-2">Bienvenido, {user.nombre}</h1>
            <p className="lead mb-0 opacity-75">
              Supervisa el estado de la plataforma Sanos y Salvos, aprueba las solicitudes de roles, gestiona reportes y localiza incidencias georreferenciadas.
            </p>
          </div>
          <div className="col-lg-4 text-end d-none d-lg-block">
            <div className="display-4 opacity-10 fw-bold">ADMIN VIEW</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-white text-center h-100" style={{ borderRadius: '15px' }}>
            <div className="fs-1 mb-1">👥</div>
            <span className="text-secondary small fw-medium d-block">Gente Registrada</span>
            <h2 className="fw-bold text-dark mt-1 mb-0">{isLoadingAdmin ? '...' : totalUsers}</h2>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-white text-center h-100" style={{ borderRadius: '15px' }}>
            <div className="fs-1 mb-1">📄</div>
            <span className="text-secondary small fw-medium d-block">Reportes del Sistema</span>
            <h2 className="fw-bold text-dark mt-1 mb-0">{isLoadingAdmin ? '...' : reportsList.length}</h2>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-white text-center h-100" style={{ borderRadius: '15px' }}>
            <div className="fs-1 mb-1">🛡️</div>
            <span className="text-secondary small fw-medium d-block">Roles por Aprobar</span>
            <h2 className="fw-bold text-danger mt-1 mb-0">{pendingRequests.length}</h2>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-white text-center h-100" style={{ borderRadius: '15px' }}>
            <div className="fs-1 mb-1">📍</div>
            <span className="text-secondary small fw-medium d-block">Reportes en el Mapa</span>
            <h2 className="fw-bold text-success mt-1 mb-0">{santiagoMarkers.length - 1}</h2>
          </div>
        </div>
      </div>

      {isLoadingAdmin ? (
        <div className="py-5 text-center">
          <Spinner size="lg" message="Cargando entorno de administración..." />
        </div>
      ) : (
        <div className="row g-4">
          {/* Santiago Chile Map (Chilean Focus) */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '15px' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                📍 Monitoreo Georreferenciado de Reportes (Santiago)
                <span className="badge bg-success rounded-pill small" style={{ fontSize: '0.7rem' }}>En Vivo</span>
              </h5>
              <div className="rounded-3 overflow-hidden shadow-inner" style={{ height: '380px', border: '1px solid #e2e8f0' }}>
                <MapContainer 
                  center={santiagoCenter} 
                  zoom={11} 
                  scrollWheelZoom={false} 
                  style={{ height: '100%', width: '100%', zIndex: 1 }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {santiagoMarkers.map((m, idx) => (
                    <Marker key={idx} position={m.pos}>
                      <Popup>
                        <strong>{m.title}</strong><br />{m.desc}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div className="mt-3 text-muted small d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 text-center text-sm-start">
                <span>Haga clic en los pines para ver detalles de los refugios, veterinarias e incidentes.</span>
                <span className="fw-semibold text-primary text-nowrap">✔ Conexión Georreferenciada Estable</span>
              </div>
            </div>
          </div>

          {/* Users Distribution Chart Card */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '15px' }}>
              <h5 className="fw-bold text-dark mb-4">📊 Distribución de Usuarios</h5>
              <p className="text-secondary small mb-4">
                Porcentaje y cantidad de cuentas por rol registrado en el sistema.
              </p>

              {/* Donut Chart Simulation using Modern CSS Bars */}
              <div className="d-flex flex-column gap-3">
                <div>
                  <div className="d-flex justify-content-between text-secondary small fw-medium mb-1">
                    <span>Usuarios Comunes</span>
                    <span>{countByRole('usuario')} ({userPercent('usuario')}%)</span>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${userPercent('usuario')}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between text-secondary small fw-medium mb-1">
                    <span>Municipalidades</span>
                    <span>{countByRole('municipalidad')} ({userPercent('municipalidad')}%)</span>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${userPercent('municipalidad')}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between text-secondary small fw-medium mb-1">
                    <span>Refugios de Animales</span>
                    <span>{countByRole('refugio')} ({userPercent('refugio')}%)</span>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div className="progress-bar bg-success" role="progressbar" style={{ width: `${userPercent('refugio')}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between text-secondary small fw-medium mb-1">
                    <span>Veterinarias</span>
                    <span>{countByRole('veterinaria')} ({userPercent('veterinaria')}%)</span>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div className="progress-bar bg-info" role="progressbar" style={{ width: `${userPercent('veterinaria')}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between text-secondary small fw-medium mb-1">
                    <span>Administradores</span>
                    <span>{countByRole('administrador')} ({userPercent('administrador')}%)</span>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${userPercent('administrador')}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top text-center text-muted small">
                Total de personas registradas en base de datos: <strong>{totalUsers}</strong>
              </div>
            </div>
          </div>

          {/* Pending Role Approvals (Aceptar / Rechazar) */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '15px' }}>
              <h5 className="fw-bold text-dark mb-3">🛡️ Solicitudes de Cambio de Rol Pendientes</h5>
              <p className="text-secondary small mb-4">
                Revisa los documentos adjuntos y aprueba o rechaza el cambio de privilegios de usuario.
              </p>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-5 text-muted border rounded" style={{ borderStyle: 'dashed' }}>
                  <div className="fs-3 mb-2">🎉</div>
                  <p className="mb-0 fw-medium small">No hay solicitudes de cambio de rol pendientes.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '320px' }}>
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="p-3 bg-light rounded border border-light-subtle">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <strong className="text-dark d-block" style={{ fontSize: '0.95rem' }}>{req.datos?.usuarioNombre as string}</strong>
                          <span className="text-muted small d-block mb-1">{req.datos?.usuarioCorreo as string}</span>
                          <span className="badge bg-primary text-uppercase" style={{ fontSize: '0.7rem' }}>
                            Solicita: {req.datos?.rolSolicitado as string}
                          </span>
                        </div>
                        <span className="badge bg-warning text-dark text-uppercase" style={{ fontSize: '0.65rem' }}>Pendiente</span>
                      </div>
                      
                      <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
                        <button
                          onClick={() => handleApprove(req.datos?.requestId as string, req.id)}
                          className="btn btn-sm btn-success fw-semibold px-3 py-1"
                          style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleReject(req.datos?.requestId as string, req.id)}
                          className="btn btn-sm btn-danger fw-semibold px-3 py-1"
                          style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                        >
                          Rechazar
                        </button>
                        {!!req.datos?.documentoValidacion && (
                          <a
                            href={req.datos.documentoValidacion as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-secondary px-3 py-1 fw-semibold d-flex align-items-center gap-1 ms-sm-auto"
                            style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                          >
                            📄 Ver Documento
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generated Reports List */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '15px' }}>
              <h5 className="fw-bold text-dark mb-3">📊 Reportes Generados en la Plataforma</h5>
              <p className="text-secondary small mb-4">
                Lista global de reportes de microservicios solicitados por los usuarios.
              </p>

              {reportsList.length === 0 ? (
                <div className="text-center py-5 text-muted border rounded" style={{ borderStyle: 'dashed' }}>
                  <div className="fs-3 mb-2">📁</div>
                  <p className="mb-0 fw-medium small">Aún no se han generado reportes en el sistema.</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr style={{ fontSize: '0.85rem' }}>
                        <th>Tipo</th>
                        <th>Fecha Creación</th>
                        <th>Estado</th>
                        <th className="text-end">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsList.map((rep) => (
                        <tr key={rep.id} style={{ fontSize: '0.85rem' }}>
                          <td className="fw-semibold text-dark text-capitalize">{rep.tipo}</td>
                          <td className="text-secondary">{new Date(rep.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge rounded-pill bg-${
                              rep.estado === 'completado' ? 'success' :
                              rep.estado === 'procesando' ? 'warning' : 'danger'
                            }`} style={{ fontSize: '0.65rem' }}>
                              {rep.estado}
                            </span>
                          </td>
                          <td className="text-end">
                            {rep.estado === 'completado' && (
                              <button
                                onClick={() => handleDownload(rep.id)}
                                disabled={downloadingId === rep.id}
                                className="btn btn-sm btn-primary border-0 bg-gradient-primary px-2"
                                style={{ borderRadius: '6px', fontSize: '0.75rem' }}
                              >
                                {downloadingId === rep.id ? 'Descargando...' : 'Descargar'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
