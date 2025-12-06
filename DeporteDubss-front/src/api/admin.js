import axiosInstance from './axiosInstance';

export const getAdminSummary = async () => {
  // Backend route is mounted under `/api/reportes/` in Django project urls
  const { data } = await axiosInstance.get('/api/reportes/admin/summary/');
  return data;
};

/**
 * Obtiene logs de bitácora con filtros opcionales
 * @param {Object} filtros - Objeto con filtros: fecha, usuario, accion
 */
export const obtenerLogsFiltrados = async (filtros = {}) => {
  const params = new URLSearchParams();
  
  if (filtros.fecha) {
    params.append('fecha', filtros.fecha);
  }
  if (filtros.usuario) {
    params.append('usuario', filtros.usuario);
  }
  if (filtros.accion) {
    params.append('accion', filtros.accion);
  }
  
  const { data } = await axiosInstance.get(`/api/reportes/bitacora/?${params.toString()}`);
  return data;
};