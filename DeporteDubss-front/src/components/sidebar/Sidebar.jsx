import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    usuarios: false,
    adminDeportiva: false,
    adminRecursos: false,
    reportes: false
  });

  // Solo mostrar sidebar para administradores
  if (!user || (user.rol !== 1 && user.rol !== "admin")) {
    return null;
  }

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClasses = (path) => {
    return `block px-4 py-2 text-sm rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-green-600 text-white font-semibold'
        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
    }`;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto shadow-lg">
      <div className="p-4">
        {/* Header - Perfil */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <Link to="/dashboard/admin" className="block mb-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                {user?.nombre?.charAt(0) || 'A'}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Dashboard</p>
                <p className="text-green-100 text-xs">Panel Principal</p>
              </div>
            </div>
          </Link>
          
          <Link to="/perfil" className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
            isActive('/perfil') ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
          }`}>
            <span className="text-xl">👤</span>
            <span className="font-medium text-sm">Mi Perfil</span>
          </Link>
        </div>

        {/* Sección: Usuarios */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('usuarios')}
            className="w-full flex items-center justify-between px-3 py-2 text-left font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <span>Usuarios</span>
            </div>
            <span className={`transform transition-transform ${openSections.usuarios ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {openSections.usuarios && (
            <div className="mt-2 ml-4 space-y-1">
              <Link to="/usuarios" className={linkClasses('/usuarios')}>
                <span className="mr-2">•</span> Usuarios
              </Link>
              <Link to="/bitacora" className={linkClasses('/bitacora')}>
                <span className="mr-2">•</span> Bitácora
              </Link>
            </div>
          )}
        </div>

        {/* Sección: Administración Deportiva */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('adminDeportiva')}
            className="w-full flex items-center justify-between px-3 py-2 text-left font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">⚽</span>
              <span>Administración Deportiva</span>
            </div>
            <span className={`transform transition-transform ${openSections.adminDeportiva ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {openSections.adminDeportiva && (
            <div className="mt-2 ml-4 space-y-1">
              <Link to="/campeonatos" className={linkClasses('/campeonatos')}>
                <span className="mr-2">•</span> Campeonatos
              </Link>
              <Link to="/partidos" className={linkClasses('/partidos')}>
                <span className="mr-2">•</span> Partidos
              </Link>
              <Link to="/incidencias" className={linkClasses('/incidencias')}>
                <span className="mr-2">•</span> Incidencias
              </Link>
              <Link to="/equipo" className={linkClasses('/equipo')}>
                <span className="mr-2">•</span> Equipos
              </Link>
            </div>
          )}
        </div>

        {/* Sección: Administración de Recursos */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('adminRecursos')}
            className="w-full flex items-center justify-between px-3 py-2 text-left font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🏟️</span>
              <span>Administración de Recursos</span>
            </div>
            <span className={`transform transition-transform ${openSections.adminRecursos ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {openSections.adminRecursos && (
            <div className="mt-2 ml-4 space-y-1">
              <Link to="/categorias" className={linkClasses('/categorias')}>
                <span className="mr-2">•</span> Categorías
              </Link>
              <Link to="/instalaciones" className={linkClasses('/instalaciones')}>
                <span className="mr-2">•</span> Instalaciones
              </Link>
              <Link to="/deportes" className={linkClasses('/deportes')}>
                <span className="mr-2">•</span> Deportes
              </Link>
            </div>
          )}
        </div>

        {/* Sección: Reportes */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('reportes')}
            className="w-full flex items-center justify-between px-3 py-2 text-left font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span>Reportes</span>
            </div>
            <span className={`transform transition-transform ${openSections.reportes ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {openSections.reportes && (
            <div className="mt-2 ml-4 space-y-1">
              <Link to="/calendario" className={linkClasses('/calendario')}>
                <span className="mr-2">•</span> Visualización Calendario
              </Link>
            </div>
          )}
        </div>

        {/* Enlaces adicionales */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link to="/historial" className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
            isActive('/historial') ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
          }`}>
            <span className="text-xl">📈</span>
            <span className="font-medium text-sm">Posiciones</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
