import React from 'react';

interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info' | 'error';
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose, dismissible = false }) => {
  const alertType = type === 'error' ? 'danger' : type;

  return (
    <div 
      className={`alert alert-${alertType} ${dismissible ? 'alert-dismissible' : ''} fade show shadow-sm border-0 d-flex justify-content-between align-items-center`} 
      role="alert"
    >
      <div className="d-flex align-items-center">
        {alertType === 'success' && <i className="bi bi-check-circle-fill me-2 fs-5"></i>}
        {alertType === 'danger' && <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>}
        {alertType === 'warning' && <i className="bi bi-exclamation-circle-fill me-2 fs-5"></i>}
        {alertType === 'info' && <i className="bi bi-info-circle-fill me-2 fs-5"></i>}
        <span>{message}</span>
      </div>
      {dismissible && (
        <button
          type="button"
          className="btn-close ms-2"
          aria-label="Close"
          onClick={onClose}
        />
      )}
    </div>
  );
};

export default Alert;
