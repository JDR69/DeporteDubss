import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Se asume que usas React Router para la navegación
import './Navbar.css';

// Importamos los iconos que usaremos
import { 
  FaReact,         // Icono de logo (ejemplo)
  FaUserCircle,    // Icono de Perfil
  FaHome,          // Icono de Inicio
  FaInfoCircle     // Icono de "Acerca de" (ejemplo)
} from 'react-icons/fa';
import { 
  FiLogIn,         // Icono de Iniciar Sesión
  FiLogOut,        // Icono de Cerrar Sesión
  FiSettings       // Icono de Configuración
} from 'react-icons/fi';
import { 
  IoMdNotificationsOutline // Icono de Notificaciones
} from 'react-icons/io';

/**
 * Componente Navbar
 * * @param {Array} navItems - Array de objetos para los enlaces de navegación.
 * Ej: [{ label: 'Inicio', path: '/', icon: <FaHome /> }]
 * @param {boolean} isLoggedIn - Estado de autenticación del usuario.
 * @param {Function} onLogout - Función a llamar al cerrar sesión.
 */
const Navbar = ({ navItems, isLoggedIn, onLogout }) => {

  // Opciones estáticas para el select
  const opciones = [
    { value: '', label: 'Seleccione una opción' },
    { value: 'categoria', label: 'Categoría' },
    { value: 'productos', label: 'Productos' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'contacto', label: 'Contacto' }
  ];

  const [seleccion, setSeleccion] = useState('');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* 1. Logo/Marca (Lado Izquierdo) */}
        <div className="navbar-logo">
          <Link to="/">
            <FaReact />
            <span>Mi App</span>
          </Link>
        </div>

        {/* 2. Select estático y Enlaces de Navegación (Centro) */}
        <div className="navbar-center">
          <select
            value={seleccion}
            onChange={e => setSeleccion(e.target.value)}
            className="navbar-select"
          >
            {opciones.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {seleccion && (
            <span className="navbar-selected">Opción seleccionada: {opciones.find(o => o.value === seleccion)?.label}</span>
          )}
        </div>

        <ul className="navbar-links">
          {(navItems || []).map((item, index) => (
            <li key={index} className="navbar-item">
              <Link to={item.path} className="navbar-link">
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 3. Iconos y Acciones de Usuario (Lado Derecho) */}
        <div className="navbar-icons">
          {isLoggedIn ? (
            <>
              <Link to="/notifications" className="navbar-icon-button" aria-label="Notificaciones">
                <IoMdNotificationsOutline />
              </Link>
              <Link to="/settings" className="navbar-icon-button" aria-label="Configuración">
                <FiSettings />
              </Link>
              <Link to="/profile" className="navbar-icon-button" aria-label="Perfil">
                <FaUserCircle />
              </Link>
              <button 
                onClick={onLogout} 
                className="navbar-icon-button logout-button" 
                aria-label="Cerrar Sesión"
              >
                <FiLogOut />
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-button-login">
              <FiLogIn />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

// Props por defecto para que el componente funcione incluso si no se le pasan
Navbar.defaultProps = {
  isLoggedIn: false,
  onLogout: () => console.warn('Función onLogout no definida'),
  navItems: [
    { label: 'Inicio', path: '/', icon: <FaHome /> },
    { label: 'Acerca de', path: '/about', icon: <FaInfoCircle /> },
    // Puedes añadir más actividades por defecto aquí
  ],
};

export default Navbar;