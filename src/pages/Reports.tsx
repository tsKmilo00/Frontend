import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Report } from '../types';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportType, setReportType] = useState<'usuarios' | 'coincidencias' | 'general'>('general');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [dateError, setDateError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Load existing reports initially
  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await apiService.getReports();
        setReports(data);
      } catch (err: any) {
        setGeneralError('Error al cargar la lista de reportes anteriores.');
      } finally {
        setIsFirstLoad(false);
      }
    };
    loadReports();
  }, []);

  // Polling every 10 seconds only if there are reports in 'procesando' state (CA 2)
  useEffect(() => {
    const hasProcessing = reports.some(r => r.estado === 'procesando');
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiService.getReports();
        setReports(data);
      } catch (err) {
        // Suppress polling errors to not disturb the user
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [reports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);
    setGeneralError(null);
    setSuccessMsg(null);

    if (!startDate || !endDate) {
      setDateError('Ambas fechas son obligatorias');
      return;
    }

    // Validate date order: Start Date <= End Date (CA 3)
    if (new Date(startDate) > new Date(endDate)) {
      setDateError('La fecha de inicio debe ser anterior o igual a la fecha de fin.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiService.generateReport({
        tipo: reportType,
        fechaInicio: startDate,
        fechaFin: endDate,
      });

      setSuccessMsg('Reporte en proceso. Te notificaremos cuando esté listo.');
      // Prepend the new report in process to the state
      setReports(prev => [response, ...prev]);
      
      // Clear form
      setStartDate('');
      setEndDate('');
    } catch (err: any) {
      setGeneralError(err.message || 'Error al solicitar la generación del reporte.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    setDownloadingId(reportId);
    setGeneralError(null);
    try {
      const blob = await apiService.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${reportId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setGeneralError(err.message || 'Error al descargar el archivo del reporte.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Filter / Request Section */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '15px' }}>
            <h4 className="fw-bold text-dark mb-3">🛠️ Generar Reporte</h4>
            <p className="text-secondary small mb-4">
              Configura filtros avanzados para consolidar datos procedentes de múltiples microservicios.
            </p>

            {successMsg && (
              <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} dismissible />
            )}

            {generalError && (
              <Alert type="danger" message={generalError} onClose={() => setGeneralError(null)} dismissible />
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label htmlFor="select-report-type" className="form-label fw-semibold text-secondary small">
                  Tipo de Reporte
                </label>
                <select
                  id="select-report-type"
                  className="form-select"
                  style={{ borderRadius: '8px', padding: '0.6rem 1rem' }}
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  disabled={isGenerating}
                >
                  <option value="general">Consolidado General</option>
                  <option value="usuarios">Estadísticas de Usuarios</option>
                  <option value="coincidencias">Alertas y Coincidencias</option>
                </select>
              </div>

              <FormInput
                label="Fecha de Inicio"
                type="date"
                name="startDate"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateError(null);
                }}
                error={dateError}
                required
                disabled={isGenerating}
              />

              <FormInput
                label="Fecha de Fin"
                type="date"
                name="endDate"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateError(null);
                }}
                required
                disabled={isGenerating}
              />

              <button
                type="submit"
                className="btn btn-primary bg-gradient-primary border-0 w-100 py-3 mt-2 fw-semibold text-white d-flex align-items-center justify-content-center gap-2"
                disabled={isGenerating || !startDate || !endDate || !!dateError}
                style={{ borderRadius: '10px' }}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Solicitando...
                  </>
                ) : (
                  'Generar Reporte Asíncrono'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Table / List Section */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '15px' }}>
            <h4 className="fw-bold text-dark mb-4">📋 Lista de Reportes</h4>

            {isFirstLoad ? (
              <Spinner message="Cargando historial de reportes..." />
            ) : reports.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <span className="fs-1 d-block mb-3">📂</span>
                <p className="mb-0 fw-medium">No se han generado reportes para este usuario.</p>
                <small>Completa el formulario lateral para solicitar un nuevo reporte.</small>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 text-secondary small fw-semibold">TIPO</th>
                      <th className="border-0 text-secondary small fw-semibold">PERÍODO</th>
                      <th className="border-0 text-secondary small fw-semibold">ESTADO</th>
                      <th className="border-0 text-secondary small fw-semibold">CREADO EN</th>
                      <th className="border-0 text-secondary small fw-semibold text-end">ACCIÓN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((rep) => {
                      const isProcessing = rep.estado === 'procesando';
                      const isCompleted = rep.estado === 'completado';
                      const isError = rep.estado === 'error';

                      return (
                        <tr key={rep.id} className="border-bottom">
                          <td>
                            <span 
                              className={`badge text-uppercase ${
                                rep.tipo === 'usuarios' ? 'bg-info-subtle text-info border border-info' :
                                rep.tipo === 'coincidencias' ? 'bg-danger-subtle text-danger border border-danger' : 
                                'bg-primary-subtle text-primary border border-primary'
                              }`}
                              style={{ padding: '0.4em 0.8em', fontSize: '0.75rem' }}
                            >
                              {rep.tipo}
                            </span>
                          </td>
                          <td className="small text-dark fw-medium">
                            {new Date(rep.fechaInicio).toLocaleDateString()} al {new Date(rep.fechaFin).toLocaleDateString()}
                          </td>
                          <td>
                            {isProcessing && (
                              <span className="badge bg-warning-subtle text-warning border border-warning d-inline-flex align-items-center gap-1">
                                <span className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px' }} role="status"></span>
                                Procesando
                              </span>
                            )}
                            {isCompleted && (
                              <span className="badge bg-success-subtle text-success border border-success">
                                Completado
                              </span>
                            )}
                            {isError && (
                              <span className="badge bg-danger-subtle text-danger border border-danger">
                                Error
                              </span>
                            )}
                          </td>
                          <td className="text-muted small">
                            {new Date(rep.createdAt).toLocaleString()}
                          </td>
                          <td className="text-end">
                            <button
                              onClick={() => handleDownload(rep.id)}
                              className="btn btn-sm btn-primary bg-gradient-primary border-0 fw-semibold text-white px-3"
                              disabled={!isCompleted || downloadingId === rep.id}
                              style={{ borderRadius: '6px' }}
                            >
                              {downloadingId === rep.id ? (
                                <span className="spinner-border spinner-border-sm" role="status" style={{ width: '12px', height: '12px' }}></span>
                              ) : (
                                'Descargar'
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-4 text-muted small">
              💡 <strong>Nota sobre sondeo:</strong> Los reportes se procesan asincrónicamente y el panel consulta automáticamente el estado del servidor cada 10 segundos. Recibirás una alerta instantánea una vez completados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
