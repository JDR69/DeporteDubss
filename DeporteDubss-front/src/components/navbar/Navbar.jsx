import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ isLoggedIn = false, onLogout }) => {
  const { user, logout } = useAuth();
  const green = "#16a34a";
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = [useRef(), useRef(), useRef()];
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  // Cierra el dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openDropdown !== null &&
        dropdownRefs[openDropdown] &&
        !dropdownRefs[openDropdown].current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <div className="w-full sticky top-0 z-50" style={{ background: green }}>
      <nav className="w-full max-w-6xl mx-auto rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between px-3 md:px-6 py-2" style={{ background: green }}>
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-white">DUBSS</span>
          <button
            className="md:hidden ml-3 text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
        </div>
        
        {/* Center: Links según rol */}
        <div className={`w-full md:w-auto ${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 flex-wrap`}>
          {user?.id && (
            <>
              <Link to="/perfil" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Perfil</Link>
              
              {/* Links para admin (rol 1) */}
              {(user?.rol === 1 || user?.rol === "admin") && (
                <>
                  <Link to="/usuarios" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Usuarios</Link>
                  <Link to="/rol-permisos" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Roles</Link>
                </>
              )}
              
              {/* Links comunes */}
              <Link to="/campeonatos" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Campeonatos</Link>
              <Link to="/equipo" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Equipos</Link>
              <Link to="/partidos" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Partidos</Link>
              <Link to="/historial" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Posiciones</Link>
              
              {/* Dropdown para recursos */}
              <div className="relative" ref={dropdownRefs[0]}>
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 0 ? null : 0)}
                  className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded flex items-center gap-1"
                >
                  Recursos ▾
                </button>
                {openDropdown === 0 && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded shadow-lg py-2 z-50 min-w-[150px]">
                    <Link to="/instalaciones" className="block px-4 py-2 text-green-700 hover:bg-green-100">Instalaciones</Link>
                    <Link to="/categorias" className="block px-4 py-2 text-green-700 hover:bg-green-100">Categorías</Link>
                    <Link to="/deportes" className="block px-4 py-2 text-green-700 hover:bg-green-100">Deportes</Link>
                  </div>
                )}
              </div>
              
              {/* Dropdown para gestión de partidos */}
              <div className="relative" ref={dropdownRefs[1]}>
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 1 ? null : 1)}
                  className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded flex items-center gap-1"
                >
                  Gestión ▾
                </button>
                {openDropdown === 1 && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded shadow-lg py-2 z-50 min-w-[150px]">
                    <Link to="/fixtures" className="block px-4 py-2 text-green-700 hover:bg-green-100">Fixtures</Link>
                    <Link to="/resultados" className="block px-4 py-2 text-green-700 hover:bg-green-100">Resultados</Link>
                    <Link to="/incidencias" className="block px-4 py-2 text-green-700 hover:bg-green-100">Incidencias</Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Login/Logout Button */}
        <div className="w-full md:w-auto flex justify-end mt-2 md:mt-0">
          {user?.id ? (
            <button onClick={handleLogout} className="bg-white text-green-700 font-semibold px-6 py-2 rounded-lg transition-colors hover:bg-green-100 flex items-center gap-2 cursor-pointer">
              Salir
            </button>
          ) : (
            <Link to="/" className="bg-white text-green-700 font-semibold px-6 py-2 rounded-lg transition-colors hover:bg-green-100 flex items-center gap-2 cursor-pointer">
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;