import React from 'react';
import NotificationPanel from '../components/NotificationPanel';

export const Notifications: React.FC = () => {
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="mb-4">
            <h2 className="fw-bold text-dark mb-1">Centro de Notificaciones</h2>
            <p className="text-secondary">
              Supervisa alertas de la cuenta, actualizaciones de seguridad y avisos importantes de tus servicios.
            </p>
          </div>
          
          <NotificationPanel />

          <div className="card border-0 shadow-sm mt-4 p-4 text-center bg-light" style={{ borderRadius: '15px' }}>
            <span className="fs-3 mb-2">🔄 Sincronización Automática</span>
            <p className="mb-0 text-muted small" style={{ lineHeight: '1.4' }}>
              El panel de alertas mantiene persistencia en base de datos local y sincroniza de forma transparente con el servidor en la nube cada 5 segundos. En caso de pérdida de conexión, las lecturas se encolarán y reintentarán de forma asíncrona sin interrumpir tu navegación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
