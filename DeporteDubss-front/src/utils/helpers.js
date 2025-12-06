/**
 * Utilidades para formateo y validación
 */

// Formateo de fechas
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Validaciones de formularios
export const validators = {
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'Este campo es requerido';
    }
    return null;
  },
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Email inválido';
    }
    return null;
  },
  
  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Debe tener al menos ${min} caracteres`;
    }
    return null;
  },
  
  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `No debe exceder ${max} caracteres`;
    }
    return null;
  },
  
  numeric: (value) => {
    if (value && isNaN(value)) {
      return 'Debe ser un número válido';
    }
    return null;
  },
  
  positiveNumber: (value) => {
    if (value && (isNaN(value) || Number(value) < 0)) {
      return 'Debe ser un número positivo';
    }
    return null;
  },
  
  dateRange: (startDate, endDate) => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return 'La fecha de inicio debe ser menor a la fecha de fin';
    }
    return null;
  }
};

// Validar múltiples reglas
export const validate = (value, rules) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

// Estados de campeonato
export const CHAMPIONSHIP_STATUS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Curso',
  FINISHED: 'Finalizado'
};

export const getChampionshipStatusColor = (status) => {
  const colors = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'En Curso': 'bg-blue-100 text-blue-800',
    'Finalizado': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Tipos de incidencias
export const INCIDENT_TYPES = {
  1: { name: 'Tarjeta Amarilla', color: 'bg-yellow-400', icon: '🟨' },
  2: { name: 'Tarjeta Roja', color: 'bg-red-500', icon: '🟥' },
  3: { name: 'Gol', color: 'bg-green-500', icon: '⚽' },
  4: { name: 'Lesión', color: 'bg-orange-500', icon: '🤕' },
  5: { name: 'Cambio', color: 'bg-blue-400', icon: '🔄' },
  6: { name: 'Falta', color: 'bg-gray-400', icon: '⚠️' },
  7: { name: 'Penal', color: 'bg-purple-500', icon: '🎯' },
  8: { name: 'Otro', color: 'bg-gray-300', icon: '📝' }
};

export const getIncidentType = (typeId) => {
  return INCIDENT_TYPES[typeId] || INCIDENT_TYPES[8];
};

// Búsqueda y filtrado
export const searchInObject = (obj, searchTerm) => {
  if (!searchTerm) return true;
  
  const term = searchTerm.toLowerCase();
  return Object.values(obj).some(value => {
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(term);
  });
};

// Ordenamiento
export const sortByField = (array, field, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    const comparison = aVal > bVal ? 1 : -1;
    return order === 'asc' ? comparison : -comparison;
  });
};

// Paginación
export const paginate = (array, page, pageSize) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
};

export const getTotalPages = (totalItems, pageSize) => {
  return Math.ceil(totalItems / pageSize);
};
