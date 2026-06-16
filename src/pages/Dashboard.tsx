import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  if (!user) return null;

  // Bogotá, Colombia Coordinates
  const centerPosition: [number, number] = [4.60971, -74.08175];
  const markerPosition1: [number, number] = [4.615, -74.085];
  const markerPosition2: [number, number] = [4.602, -74.075];

  return (
    <div className="container py-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-primary text-white rounded-4 p-4 p-md-5 mb-4 shadow-sm relative overflow-hidden">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <h1 className="display-5 fw-bold mb-2">¡Hola, {user.nombre}! 👋</h1>
            <p className="lead mb-0 opacity-90">
              Bienvenido al centro de administración. Aquí puedes gestionar tu perfil, supervisar alertas e interactuar con los servicios integrados.
            </p>
          </div>
          <div className="col-lg-4 text-end d-none d-lg-block">
            <div className="display-2 opacity-20 fw-bold">DASHBOARD</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="row g-4">
        {/* Navigation Cards */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm card-hover p-3" style={{ borderRadius: '15px' }}>
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <div className="fs-1 mb-2 text-primary">👤</div>
                <h5 className="fw-bold text-dark">Mi Perfil</h5>
                <p className="text-secondary small mb-3">
                  Visualiza tus datos personales, verifica tu nivel de rol y revisa la fecha de tu registro.
                </p>
              </div>
              <Link to="/profile" className="btn btn-outline-primary w-100 fw-semibold" style={{ borderRadius: '8px' }}>
                Ir a Perfil
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm card-hover p-3" style={{ borderRadius: '15px' }}>
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <div className="fs-1 mb-2 text-warning relative">
                  🔔
                  {unreadCount > 0 && (
                    <span className="position-absolute translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem', left: '42px', top: '15px' }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <h5 className="fw-bold text-dark">Notificaciones</h5>
                <p className="text-secondary small mb-3">
                  Revisa alertas importantes, registros locales e informes sincronizados con persistencia local.
                </p>
              </div>
              <Link to="/notifications" className="btn btn-outline-warning w-100 fw-semibold" style={{ borderRadius: '8px' }}>
                Ver Alertas
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm card-hover p-3" style={{ borderRadius: '15px' }}>
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <div className="fs-1 mb-2 text-info">📊</div>
                <h5 className="fw-bold text-dark">Reportes</h5>
                <p className="text-secondary small mb-3">
                  Genera informes detallados de microservicios, aplica filtros por tipo y descárgalos asincrónicamente.
                </p>
              </div>
              <Link to="/reports" className="btn btn-outline-info w-100 fw-semibold" style={{ borderRadius: '8px' }}>
                Generar Reportes
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm card-hover p-3" style={{ borderRadius: '15px' }}>
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <div className="fs-1 mb-2 text-danger">🛡️</div>
                <h5 className="fw-bold text-dark">Gestión de Rol</h5>
                <p className="text-secondary small mb-3">
                  Solicita una actualización de rol subiendo tus documentos de validación e ingresando un nuevo rol.
                </p>
              </div>
              <Link to="/manage-role" className="btn btn-outline-danger w-100 fw-semibold" style={{ borderRadius: '8px' }}>
                Cambiar Rol
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive Map (Leaflet) */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '15px' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              📍 Área de Coincidencias en Tiempo Real
              <span className="badge bg-success rounded-pill small" style={{ fontSize: '0.7rem' }}>En Vivo</span>
            </h5>
            <div className="rounded-3 overflow-hidden shadow-inner" style={{ height: '350px', border: '1px solid #e2e8f0' }}>
              <MapContainer 
                center={centerPosition} 
                zoom={13} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={centerPosition}>
                  <Popup>
                    <strong>Sede Central</strong><br />Punto de control principal.
                  </Popup>
                </Marker>
                <Marker position={markerPosition1}>
                  <Popup>
                    <strong>Alerta A-102</strong><br />Reporte de coincidencia activo.
                  </Popup>
                </Marker>
                <Marker position={markerPosition2}>
                  <Popup>
                    <strong>Alerta B-88</strong><br />Incidencia en resolución.
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="mt-3 text-muted small d-flex justify-content-between align-items-center">
              <span>Haga clic en los marcadores para ver detalles de las incidencias del mapa.</span>
              <span className="fw-medium text-success">✔ Conectado a Leaflet Map Engine</span>
            </div>
          </div>
        </div>

        {/* Session Info Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '15px' }}>
            <h5 className="fw-bold mb-4">🔑 Información de la Sesión</h5>
            
            <div className="mb-4">
              <span className="text-secondary small d-block mb-1">USUARIO IDENTIFICADO</span>
              <strong className="text-dark d-block">{user.nombre}</strong>
              <span className="text-muted small">{user.correo}</span>
            </div>

            <div className="mb-4">
              <span className="text-secondary small d-block mb-1">ROL ACTUAL</span>
              <span className="badge bg-primary text-uppercase px-3 py-2" style={{ fontSize: '0.75rem' }}>
                {user.rol}
              </span>
            </div>

            <div className="mb-4">
              <span className="text-secondary small d-block mb-1">ESTADO DEL TOKEN (JWT)</span>
              <div className="d-flex align-items-center gap-2">
                <span className="rounded-circle bg-success" style={{ width: '10px', height: '10px', display: 'inline-block' }}></span>
                <span className="text-success fw-medium small">Activo & Válido</span>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-secondary small d-block mb-1">MÉTODO DE AUTENTICACIÓN</span>
              <code className="bg-light text-dark p-1 rounded small">Bearer JWT Storage</code>
            </div>

            <hr className="my-4 text-muted" />

            <div>
              <span className="text-secondary small d-block mb-2">HERRAMIENTAS ADMINISTRATIVAS</span>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-light text-dark border">Bootstrap 5.3</span>
                <span className="badge bg-light text-dark border">React 18</span>
                <span className="badge bg-light text-dark border">TypeScript 5</span>
                <span className="badge bg-light text-dark border">Leaflet 1.9</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
