import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { User } from '../types';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export const UserProfile: React.FC = () => {
  const { user, reloadUser } = useAuth();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchProfile = async (silent = false) => {
      if (!user) return;
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const data = await apiService.getUserByEmail(user.correo);
        if (active) {
          setProfileData(data);
          setError(null);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Error al obtener la información de perfil.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    fetchProfile();

    // Refrescar cada 10 segundos automáticamente (CA 1)
    const interval = setInterval(() => {
      fetchProfile(true);
      reloadUser();
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user, reloadUser]);

  if (isLoading) {
    return (
      <div className="container py-5">
        <Spinner message="Cargando perfil..." />
      </div>
    );
  }

  const profile = profileData || user;
  if (!profile) return null;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          
          {error && (
            <Alert type="danger" message={error} onClose={() => setError(null)} dismissible />
          )}

          {/* Profile Card */}
          <div className="card border-0 shadow-sm p-4 p-md-5 mb-4 relative" style={{ borderRadius: '15px' }}>
            
            {/* Sync Refresh Pulse Indicator */}
            {isRefreshing && (
              <div 
                className="position-absolute d-flex align-items-center gap-1 text-primary small" 
                style={{ top: '20px', right: '20px', fontSize: '0.8rem' }}
              >
                <span className="spinner-border spinner-border-sm" role="status" style={{ width: '12px', height: '12px' }}></span>
                Refrescando...
              </div>
            )}

            <div className="d-flex flex-column flex-sm-row align-items-center gap-4 border-bottom pb-4 mb-4">
              <div 
                className="avatar-large bg-gradient-primary text-white d-flex align-items-center justify-content-center fw-bold shadow"
                style={{ width: '80px', height: '80px', borderRadius: '50%', fontSize: '2rem' }}
              >
                {profile.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="text-center text-sm-start">
                <h3 className="fw-bold mb-1 text-dark">{profile.nombre}</h3>
                <span className="badge bg-primary text-uppercase px-3 py-2" style={{ fontSize: '0.75rem' }}>
                  💼 {profile.rol}
                </span>
                <span className="text-muted small ms-2 d-block d-sm-inline mt-1 mt-sm-0">
                  Registrado el {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-12 col-sm-6">
                <div className="p-3 bg-light rounded-3">
                  <span className="text-secondary small d-block mb-1">CORREO ELECTRÓNICO</span>
                  <span className="fw-semibold text-dark d-block text-break">{profile.correo}</span>
                </div>
              </div>
              
              <div className="col-12 col-sm-6">
                <div className="p-3 bg-light rounded-3">
                  <span className="text-secondary small d-block mb-1">TELÉFONO</span>
                  <span className="fw-semibold text-dark d-block">{profile.telefono || 'No proporcionado'}</span>
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="p-3 bg-light rounded-3">
                  <span className="text-secondary small d-block mb-1">ID DE USUARIO</span>
                  <span className="text-muted font-monospace small d-block">{profile.id}</span>
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="p-3 bg-light rounded-3">
                  <span className="text-secondary small d-block mb-1">DOCUMENTO DE VALIDACIÓN</span>
                  {profile.documentoValidacion ? (
                    <a 
                      href={profile.documentoValidacion} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary fw-semibold text-decoration-none d-block text-truncate hover-underline"
                    >
                      🔗 {profile.documentoValidacion}
                    </a>
                  ) : (
                    <span className="text-muted small d-block">Ninguno subido aún.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 text-center text-muted small">
              Los datos se sincronizan con la base de datos cada 10 segundos de forma automática.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
