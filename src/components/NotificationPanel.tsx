import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import Spinner from './Spinner';

export const NotificationPanel: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
      <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold d-flex align-items-center text-gradient-primary">
          🔔 Notificaciones
          {unreadCount > 0 && (
            <span className="badge bg-danger ms-2 rounded-pill fs-7" style={{ fontSize: '0.75rem' }}>
              {unreadCount} no leídas
            </span>
          )}
        </h5>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead} 
            className="btn btn-sm btn-outline-primary fw-semibold"
            style={{ borderRadius: '8px' }}
          >
            Marcar todas leídas
          </button>
        )}
      </div>
      <div className="card-body p-0">
        {isLoading ? (
          <Spinner message="Cargando notificaciones..." />
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div className="fs-1 mb-2">🎉</div>
            <p className="mb-0 fw-medium">No tienes notificaciones pendientes.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush" style={{ maxHeight: '420px', overflowY: 'auto', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`list-group-item list-group-item-action border-0 px-4 py-3 d-flex align-items-start gap-3 transition-all ${
                  !notif.leida ? 'bg-light-active' : ''
                }`}
                style={{ borderBottom: '1px solid #f1f3f9' }}
              >
                <div 
                  className={`rounded-circle p-2 d-flex align-items-center justify-content-center text-white`}
                  style={{
                    backgroundColor: 
                      notif.tipo === 'success' ? '#198754' :
                      notif.tipo === 'warning' ? '#ffc107' :
                      notif.tipo === 'error' ? '#dc3545' : '#0dcaf0',
                    width: '32px',
                    height: '32px',
                    flexShrink: 0
                  }}
                >
                  {notif.tipo === 'success' && <i className="bi bi-check-lg" style={{ fontSize: '0.9rem' }}></i>}
                  {notif.tipo === 'info' && <i className="bi bi-info-lg" style={{ fontSize: '0.9rem' }}></i>}
                  {notif.tipo === 'warning' && <i className="bi bi-exclamation-lg" style={{ fontSize: '0.9rem' }}></i>}
                  {notif.tipo === 'error' && <i className="bi bi-x-lg" style={{ fontSize: '0.9rem' }}></i>}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className={`mb-1 ${!notif.leida ? 'fw-bold text-dark' : 'text-secondary'}`}>
                      {notif.titulo}
                    </h6>
                    <small className="text-muted ms-2" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                  <p className="mb-1 text-muted small" style={{ lineHeight: '1.4', fontSize: '0.85rem' }}>
                    {notif.descripcion}
                  </p>
                  <div className="d-flex align-items-center gap-3 mt-2">
                    {!notif.leida && (
                      <button 
                        onClick={() => markAsRead(notif.id)} 
                        className="btn btn-link btn-sm p-0 text-primary text-decoration-none fw-semibold"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Marcar como leída
                      </button>
                    )}
                    {notif.sincronizado === false && (
                      <span className="text-warning d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                        <span className="spinner-grow spinner-grow-sm" style={{ width: '8px', height: '8px' }}></span>
                        Pendiente de sincronizar...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
