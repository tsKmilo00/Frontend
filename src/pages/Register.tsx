import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import { validateEmail, validatePassword, validatePhone } from '../services/validators';

export const Register: React.FC = () => {
  const { register, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    clearError();
  }, [isAuthenticated, navigate, clearError]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNombre(val);
    if (val.trim().length < 3) {
      setNameError('El nombre debe tener al menos 3 caracteres');
    } else {
      setNameError(null);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (val && !validateEmail(val)) {
      setEmailError('Formato de correo electrónico inválido');
    } else {
      setEmailError(null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (val && !validatePassword(val)) {
      setPasswordError('La contraseña no cumple con todos los requisitos');
    } else {
      setPasswordError(null);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTelefono(val);
    if (val && !validatePhone(val)) {
      phoneError || setPhoneError('Formato de teléfono inválido (7 a 15 números)');
    } else {
      setPhoneError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    if (!nombre || nombre.trim().length < 3) {
      setNameError('El nombre debe tener al menos 3 caracteres');
      hasError = true;
    }
    if (!validateEmail(email)) {
      setEmailError('Correo electrónico inválido');
      hasError = true;
    }
    if (!validatePassword(password)) {
      setPasswordError('Contraseña no cumple con los requisitos');
      hasError = true;
    }
    if (!validatePhone(telefono)) {
      setPhoneError('Teléfono inválido');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      await register({
        nombre,
        correo: email,
        contrasena: password,
        telefono
      });
      navigate('/login', { 
        state: { message: '¡Registro completado con éxito! Por favor, inicia sesión.' } 
      });
    } catch (err: any) {
      // Error will be updated in context (e.g. "El correo ya está registrado")
    } finally {
      setIsSubmitting(false);
    }
  };

  // Requisitos de contraseña
  const hasMinLen = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /\d/.test(password);

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-page-gradient py-5 px-3">
      <div className="card border-0 shadow-lg p-4 p-md-5 auth-card text-center" style={{ maxWidth: '540px', width: '100%', borderRadius: '20px' }}>
        <div className="mb-4">
          <div className="brand-logo mx-auto mb-3">
            <span className="brand-logo-inner"></span>
          </div>
          <h2 className="fw-bold text-dark mb-1">Crea tu cuenta</h2>
          <p className="text-secondary">Regístrate para comenzar a usar la plataforma</p>
        </div>

        {error && (
          <Alert type="danger" message={error} onClose={clearError} dismissible />
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Nombre Completo"
            type="text"
            name="nombre"
            value={nombre}
            onChange={handleNameChange}
            error={nameError}
            placeholder="Juan Pérez"
            required
            disabled={isSubmitting}
            autoFocus
          />

          <FormInput
            label="Correo Electrónico"
            type="email"
            name="correo"
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            placeholder="correo@ejemplo.com"
            required
            disabled={isSubmitting}
          />

          <FormInput
            label="Número de Teléfono"
            type="tel"
            name="telefono"
            value={telefono}
            onChange={handlePhoneChange}
            error={phoneError}
            placeholder="3001234567"
            required
            disabled={isSubmitting}
          />

          <FormInput
            label="Contraseña"
            type="password"
            name="contrasena"
            value={password}
            onChange={handlePasswordChange}
            error={passwordError}
            placeholder="••••••••"
            required
            disabled={isSubmitting}
          />

          {/* Requisitos de la contraseña visualizados interactivamente */}
          <div className="text-start mb-4 p-3 bg-light rounded" style={{ fontSize: '0.85rem' }}>
            <span className="d-block fw-semibold text-secondary mb-2">Requisitos de contraseña:</span>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={hasMinLen ? 'text-success' : 'text-muted'}>
                {hasMinLen ? '✅' : '❌'} Mínimo 6 caracteres
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={hasUpper ? 'text-success' : 'text-muted'}>
                {hasUpper ? '✅' : '❌'} Al menos una mayúscula
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className={hasNum ? 'text-success' : 'text-muted'}>
                {hasNum ? '✅' : '❌'} Al menos un número
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary bg-gradient-primary border-0 w-100 py-3 fw-semibold text-white d-flex align-items-center justify-content-center gap-2"
            disabled={isSubmitting || !!nameError || !!emailError || !!passwordError || !!phoneError || !nombre || !email || !password || !telefono}
            style={{ borderRadius: '10px', fontSize: '1.05rem' }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Registrando...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-muted mb-0">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-primary fw-semibold text-decoration-none hover-underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
