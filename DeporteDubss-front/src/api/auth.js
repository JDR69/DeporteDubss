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
export const getEquipos = () => axiosInstance.get('/api/equipos/');
export const getEquipo = (id) => axiosInstance.get(`/api/equipos/${id}/`);
export const createEquipo = (data) => axiosInstance.post('/api/equipos/', data);
export const updateEquipo = (id, data) => axiosInstance.put(`/api/equipos/${id}/`, data);
export const deleteEquipo = (id) => axiosInstance.delete(`/api/equipos/${id}/`);
export const agregarJugadoresAEquipo = (id, data) => axiosInstance.post(`/api/equipos/${id}/agregar_jugadores/`, data);

// Campeonatos
export const getCampeonatos = () => axiosInstance.get('/api/campeonatos/');
export const getCampeonato = (id) => axiosInstance.get(`/api/campeonatos/${id}/`);
export const createCampeonato = (data) => axiosInstance.post('/api/campeonatos/', data);
export const updateCampeonato = (id, data) => axiosInstance.put(`/api/campeonatos/${id}/`, data);
export const deleteCampeonato = (id) => axiosInstance.delete(`/api/campeonatos/${id}/`);


// Deportes
export const getDeportes = () => axiosInstance.get('/api/deportes/');
export const createDeporte = (data) => axiosInstance.post('/api/deportes/', data);
export const updateDeporte = (id, data) => axiosInstance.put(`/api/deportes/${id}/`, data);
export const deleteDeporte = (id) => axiosInstance.delete(`/api/deportes/${id}/`);

// Categorías
export const getCategorias = () => axiosInstance.get('/api/categorias/');
export const createCategoria = (data) => axiosInstance.post('/api/categorias/', data);
export const updateCategoria = (id, data) => axiosInstance.put(`/api/categorias/${id}/`, data);
export const deleteCategoria = (id) => axiosInstance.delete(`/api/categorias/${id}/`);

