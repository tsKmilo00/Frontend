import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import { validateEmail } from '../services/validators';

export const Login: React.FC = () => {
  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccessMessage(location.state.message);
      // Clear navigation state to prevent showing it on page reload
      window.history.replaceState({}, document.title);
    }
    clearError();
  }, [location, clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (val && !validateEmail(val)) {
      setEmailError('Formato de correo electrónico inválido');
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (!password) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      await login({ correo: email, contrasena: password });
      navigate('/dashboard');
    } catch (err: any) {
      // Error will be updated in useAuth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-page-gradient py-5 px-3">
      <div className="card border-0 shadow-lg p-4 p-md-5 auth-card text-center" style={{ maxWidth: '480px', width: '100%', borderRadius: '20px' }}>
        <div className="mb-4">
          <div className="brand-logo mx-auto mb-3">
            <span className="brand-logo-inner"></span>
          </div>
          <h2 className="fw-bold text-dark mb-1">Bienvenido de nuevo</h2>
          <p className="text-secondary">Ingresa tus credenciales para acceder</p>
        </div>

        {successMessage && (
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} dismissible />
        )}

        {error && (
          <Alert type="danger" message={error} onClose={clearError} dismissible />
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Correo Electrónico"
            type="email"
            name="correo"
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            placeholder="correo@ejemplo.com"
            required
            autoFocus
            disabled={isSubmitting}
          />

          <FormInput
            label="Contraseña"
            type="password"
            name="contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isSubmitting}
          />

          <button
            type="submit"
            className="btn btn-primary bg-gradient-primary border-0 w-100 py-3 mt-3 fw-semibold text-white d-flex align-items-center justify-content-center gap-2"
            disabled={isSubmitting || !!emailError || !email || !password}
            style={{ borderRadius: '10px', fontSize: '1.05rem', transition: 'transform 0.2s' }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Iniciando sesión...
              </>
            ) : (
              'Ingresar a la Plataforma'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-muted mb-0">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-primary fw-semibold text-decoration-none hover-underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
