import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  id,
  className,
  style,
  ...props
}) => {
  const inputId = id || `input-${props.name}`;
  return (
    <div className="mb-3 text-start">
      <label htmlFor={inputId} className="form-label fw-semibold text-secondary small">
        {label} {props.required && <span className="text-danger">*</span>}
      </label>
      <input
        id={inputId}
        className={`form-control form-control-lg ${error ? 'is-invalid' : ''} ${className || ''}`}
        style={{ borderRadius: '8px', ...style }}
        {...props}
      />
      {error && <div className="invalid-feedback text-start mt-1" style={{ fontSize: '0.85rem' }}>{error}</div>}
    </div>
  );
};

export default FormInput;
