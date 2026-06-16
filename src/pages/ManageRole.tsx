import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { validateUrl } from '../services/validators';

export const ManageRole: React.FC = () => {
  const { user, reloadUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'usuario' | 'municipalidad' | 'refugio' | 'veterinaria'>('municipalidad');
  const [documentUrl, setDocumentUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDocumentUrl(val);
    if (val && !validateUrl(val)) {
      setUrlError('Debes ingresar una URL válida (ej: https://ejemplo.com/documento.pdf)');
    } else {
      setUrlError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !documentUrl) return;

    if (!validateUrl(documentUrl)) {
      setUrlError('URL inválida');
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      await apiService.requestRoleChange({
        rol: selectedRole,
        documentoValidacion: documentUrl
      });
      setStatusMessage({
        type: 'success',
        text: `¡Solicitud de cambio de rol enviada con éxito! Tu solicitud para el rol "${selectedRole}" está pendiente de aprobación por el administrador.`
      });
      setDocumentUrl('');
      await reloadUser();
    } catch (err: any) {
      setStatusMessage({
        type: 'danger',
        text: err.message || 'Error al procesar la solicitud de cambio de rol.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Button disabled until documentUrl and role are set, URL is valid, or while loading (CA 2)
  const isButtonDisabled = !documentUrl || !selectedRole || !!urlError || isLoading;

  if (!user) return null;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '15px' }}>
            <div className="text-center mb-4">
              <span className="fs-1">🛡️</span>
              <h3 className="fw-bold mt-2 text-dark">Solicitud de Cambio de Rol</h3>
              <p className="text-secondary small">
                Envía tus documentos de acreditación para subir de nivel en la plataforma.
              </p>
            </div>

            {statusMessage && (
              <Alert 
                type={statusMessage.type} 
                message={statusMessage.text} 
                onClose={() => setStatusMessage(null)} 
                dismissible 
              />
            )}

            {isLoading && (
              <Spinner size="md" message="Procesando solicitud de cambio..." />
            )}

            {!isLoading && (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="select-rol" className="form-label fw-semibold text-secondary small">
                    Rol Deseado
                  </label>
                  <select
                    id="select-rol"
                    className="form-select form-select-lg"
                    style={{ borderRadius: '8px', fontSize: '1rem' }}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    disabled={isLoading}
                  >
                    <option value="usuario">Usuario</option>
                    <option value="municipalidad">Municipalidad</option>
                    <option value="refugio">Refugio</option>
                    <option value="veterinaria">Veterinaria</option>
                  </select>
                  <div className="form-text small text-muted mt-1">
                    Tu rol actual es: <strong className="text-uppercase text-primary">{user.rol}</strong>
                  </div>
                </div>

                <FormInput
                  label="URL del Documento de Validación"
                  type="url"
                  name="documentUrl"
                  value={documentUrl}
                  onChange={handleUrlChange}
                  error={urlError}
                  placeholder="https://servidor.com/mi-archivo-verificacion.pdf"
                  required
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  className="btn btn-primary bg-gradient-primary border-0 w-100 py-3 mt-3 fw-semibold text-white d-flex align-items-center justify-content-center gap-2"
                  disabled={isButtonDisabled}
                  style={{ borderRadius: '10px', fontSize: '1.05rem' }}
                >
                  Solicitar Actualización de Rol
                </button>
              </form>
            )}
            
            <div className="mt-4 pt-3 border-top text-muted small text-center">
              Tu solicitud cargará automáticamente los archivos adjuntos y creará una notificación local de seguimiento.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRole;
