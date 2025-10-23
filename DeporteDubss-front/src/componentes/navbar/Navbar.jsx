import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ isLoggedIn = false, onLogout }) => {
  const { user } = useAuth();
  const green = "#16a34a";
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = [useRef(), useRef(), useRef()];

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
    <div className="w-full" style={{ background: green }}>
      <nav className="w-full max-w-4xl mx-auto rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between px-2 md:px-4 py-2" style={{ background: green }}>
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-white">DUBSS</span>
        </div>
        {/* Center: Links según rol */}
        <div className="w-full md:w-auto flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6">
          {/* ADMIN: rol-permisos, instalaciones, campeonatos */}
          {user?.rol === "admin" && (
            <>
              <Link to="/rol-permisos" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Rol Permisos</Link>
              <Link to="/instalaciones" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Instalaciones</Link>
              <Link to="/campeonatos" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Campeonatos</Link>
            </>
          )}
          {/* DELEGADO: campeonatos, equipo */}
          {user?.rol === "delegado" && (
            <>
              <Link to="/campeonatos" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Campeonatos</Link>
              <Link to="/equipo" className="text-white font-medium px-2 py-1 hover:bg-green-700 rounded">Equipo</Link>
            </>
          )}
        </div>
        {/* Login/Logout Button */}
        <div className="w-full md:w-auto flex justify-end mt-2 md:mt-0">
          {isLoggedIn ? (
              <button onClick={onLogout} className="bg-white text-green-700 font-semibold px-6 py-2 rounded-lg transition-colors hover:bg-green-100 flex items-center gap-2 cursor-pointer">Salir</button>
          ) : (
            <Link to="/login" className="bg-white text-green-700 font-semibold px-6 py-2 rounded-lg transition-colors hover:bg-green-100 flex items-center gap-2 cursor-pointer">Salir</Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;