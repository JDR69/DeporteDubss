// ...existing code...
// Obtener roles
export const getRoles = () => axiosInstance.get('/api/roles/');

import axiosInstance from './axiosInstance';

// Roles
export const getRol = (id) => axiosInstance.get(`/api/roles/${id}/`);
export const createRol = (data) => axiosInstance.post('/api/roles/', data);
export const updateRol = (id, data) => axiosInstance.put(`/api/roles/${id}/`, data);
export const deleteRol = (id) => axiosInstance.delete(`/api/roles/${id}/`);

// Equipos
export const getEquipos = () => axiosInstance.get('/api/adm_deportiva/equipos/');
export const getEquipo = (id) => axiosInstance.get(`/api/adm_deportiva/equipos/${id}/`);
export const createEquipo = (data) => axiosInstance.post('/api/adm_deportiva/equipos/', data);
export const updateEquipo = (id, data) => axiosInstance.put(`/api/adm_deportiva/equipos/${id}/`, data);
export const deleteEquipo = (id) => axiosInstance.delete(`/api/adm_deportiva/equipos/${id}/`);

// Campeonatos
export const getCampeonatos = () => axiosInstance.get('/api/adm_deportiva/campeonatos/');
export const getCampeonato = (id) => axiosInstance.get(`/api/adm_deportiva/campeonatos/${id}/`);
export const createCampeonato = (data) => axiosInstance.post('/api/adm_deportiva/campeonatos/', data);
export const updateCampeonato = (id, data) => axiosInstance.put(`/api/adm_deportiva/campeonatos/${id}/`, data);
export const deleteCampeonato = (id) => axiosInstance.delete(`/api/adm_deportiva/campeonatos/${id}/`);


// Deportes
export const getDeportes = () => axiosInstance.get('/api/recursos/deportes/');
export const getDeporte = (id) => axiosInstance.get(`/api/recursos/deportes/${id}/`);
export const createDeporte = (data) => axiosInstance.post('/api/recursos/deportes/', data);
export const updateDeporte = (id, data) => axiosInstance.put(`/api/recursos/deportes/${id}/`, data);
export const deleteDeporte = (id) => axiosInstance.delete(`/api/recursos/deportes/${id}/`);

// Categorías
export const getCategorias = () => axiosInstance.get('/api/recursos/categorias/');
export const getCategoria = (id) => axiosInstance.get(`/api/recursos/categorias/${id}/`);
export const createCategoria = (data) => axiosInstance.post('/api/recursos/categorias/', data);
export const updateCategoria = (id, data) => axiosInstance.put(`/api/recursos/categorias/${id}/`, data);
export const deleteCategoria = (id) => axiosInstance.delete(`/api/recursos/categorias/${id}/`);

// Instalaciones
export const getInstalaciones = () => axiosInstance.get('/api/recursos/instalaciones/');
export const getInstalacion = (id) => axiosInstance.get(`/api/recursos/instalaciones/${id}/`);
export const createInstalacion = (data) => axiosInstance.post('/api/recursos/instalaciones/', data);
export const updateInstalacion = (id, data) => axiosInstance.put(`/api/recursos/instalaciones/${id}/`, data);
export const deleteInstalacion = (id) => axiosInstance.delete(`/api/recursos/instalaciones/${id}/`);

// Usuarios
export const getUsuarios = () => axiosInstance.get('/api/auth/users/');
export const getUsuario = (id) => axiosInstance.get(`/api/auth/users/${id}/`);
export const createUsuario = (data) => axiosInstance.post('/api/auth/users/', data);
export const updateUsuario = (id, data) => axiosInstance.put(`/api/auth/users/${id}/`, data);
export const deleteUsuario = (id) => axiosInstance.delete(`/api/auth/users/${id}/`);

// Fixtures
export const getFixtures = () => axiosInstance.get('/api/adm_deportiva/fixtures/');
export const getFixture = (id) => axiosInstance.get(`/api/adm_deportiva/fixtures/${id}/`);
export const createFixture = (data) => axiosInstance.post('/api/adm_deportiva/fixtures/', data);
export const updateFixture = (id, data) => axiosInstance.put(`/api/adm_deportiva/fixtures/${id}/`, data);
export const deleteFixture = (id) => axiosInstance.delete(`/api/adm_deportiva/fixtures/${id}/`);

// Resultados
export const getResultados = () => axiosInstance.get('/api/adm_deportiva/resultados/');
export const getResultado = (id) => axiosInstance.get(`/api/adm_deportiva/resultados/${id}/`);
export const createResultado = (data) => axiosInstance.post('/api/adm_deportiva/resultados/', data);
export const updateResultado = (id, data) => axiosInstance.put(`/api/adm_deportiva/resultados/${id}/`, data);
export const deleteResultado = (id) => axiosInstance.delete(`/api/adm_deportiva/resultados/${id}/`);

// Partidos
export const getPartidos = () => axiosInstance.get('/api/adm_deportiva/partidos/');
export const getPartido = (id) => axiosInstance.get(`/api/adm_deportiva/partidos/${id}/`);
export const createPartido = (data) => axiosInstance.post('/api/adm_deportiva/partidos/', data);
export const updatePartido = (id, data) => axiosInstance.put(`/api/adm_deportiva/partidos/${id}/`, data);
export const deletePartido = (id) => axiosInstance.delete(`/api/adm_deportiva/partidos/${id}/`);

// Historial
export const getHistoriales = () => axiosInstance.get('/api/adm_deportiva/historial/');
export const getHistorial = (id) => axiosInstance.get(`/api/adm_deportiva/historial/${id}/`);
export const createHistorial = (data) => axiosInstance.post('/api/adm_deportiva/historial/', data);
export const updateHistorial = (id, data) => axiosInstance.put(`/api/adm_deportiva/historial/${id}/`, data);
export const deleteHistorial = (id) => axiosInstance.delete(`/api/adm_deportiva/historial/${id}/`);

// Incidencias
export const getIncidencias = () => axiosInstance.get('/api/adm_deportiva/incidencias/');
export const getIncidencia = (id) => axiosInstance.get(`/api/adm_deportiva/incidencias/${id}/`);
export const createIncidencia = (data) => axiosInstance.post('/api/adm_deportiva/incidencias/', data);
export const updateIncidencia = (id, data) => axiosInstance.put(`/api/adm_deportiva/incidencias/${id}/`, data);
export const deleteIncidencia = (id) => axiosInstance.delete(`/api/adm_deportiva/incidencias/${id}/`);

