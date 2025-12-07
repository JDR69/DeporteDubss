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
      <nav className="w-full mx-auto shadow-lg flex items-center justify-between px-6 py-3" style={{ background: green }}>
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-white">DUBSS</span>
        </div>
        
        {/* User Info and Logout */}
        <div className="flex items-center gap-4">
          {user?.id && (
            <span className="text-white font-medium">
              {user?.nombre} {user?.apellido}
            </span>
          )}
          
          {user?.id ? (
            <button onClick={handleLogout} className="bg-white text-green-700 font-semibold px-6 py-2 rounded-lg transition-colors hover:bg-green-100 flex items-center gap-2 cursor-pointer">
              Salir
            </button>
          ) : (
            <Link to="/login" className="bg-white text-green-700 font-semibold px-6 py-2 rounded-lg transition-colors hover:bg-green-100 flex items-center gap-2 cursor-pointer">
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;