import React from 'react';

interface FormInputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  autoFocus = false,
  id
}) => {
  const inputId = id || `input-${name}`;
  return (
    <div className="mb-3 text-start">
      <label htmlFor={inputId} className="form-label fw-semibold text-secondary small">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={inputId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        required={required}
        className={`form-control form-control-lg ${error ? 'is-invalid' : ''}`}
        style={{ borderRadius: '8px' }}
      />
      {error && <div className="invalid-feedback text-start mt-1" style={{ fontSize: '0.85rem' }}>{error}</div>}
    </div>
  );
};

export default FormInput;
