import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', message }) => {
  let spinnerClass = '';
  let sizeStyle = { width: '2.5rem', height: '2.5rem', borderWidth: '0.25em' };

  if (size === 'sm') {
    spinnerClass = 'spinner-border-sm';
    sizeStyle = { width: '1.2rem', height: '1.2rem', borderWidth: '0.15em' };
  } else if (size === 'lg') {
    sizeStyle = { width: '4rem', height: '4rem', borderWidth: '0.35em' };
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-3 text-center my-3">
      <div 
        className={`spinner-border text-primary ${spinnerClass}`} 
        style={sizeStyle}
        role="status"
      >
        <span className="visually-hidden">Cargando...</span>
      </div>
      {message && <div className="mt-2 text-secondary fw-medium">{message}</div>}
    </div>
  );
};

export default Spinner;
