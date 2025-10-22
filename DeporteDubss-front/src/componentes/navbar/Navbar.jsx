import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ isLoggedIn = false, onLogout }) => {
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
          <span className="text-2xl font-bold text-white">FlyonUI</span>
        </div>
        {/* Center: Dropdown buttons */}
  <div className="w-full md:w-auto flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6">
          {/* Dropdown 1 */}
          <div className="relative w-full md:w-auto" ref={dropdownRefs[0]}>
            <button
              className="text-white font-medium px-2 py-1 flex items-center gap-1 focus:outline-none w-full md:w-auto cursor-pointer"
              onClick={() => setOpenDropdown(openDropdown === 0 ? null : 0)}
            >
              Services
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openDropdown === 0 && (
              <div className="absolute left-0 mt-2 w-40 rounded shadow-lg z-10" style={{ background: green }}>
                <Link to="/templates" className="block px-4 py-2 text-white hover:bg-green-700 cursor-pointer" onClick={() => setOpenDropdown(null)}>Templates</Link>
                <Link to="/ui-kits" className="block px-4 py-2 text-white hover:bg-green-700 cursor-pointer" onClick={() => setOpenDropdown(null)}>UI Kits</Link>
                <Link to="/components" className="block px-4 py-2 text-white hover:bg-green-700 cursor-pointer" onClick={() => setOpenDropdown(null)}>Components</Link>
              </div>
            )}
          </div>
          {/* Dropdown 2 */}
          <div className="relative w-full md:w-auto" ref={dropdownRefs[1]}>
            <button
              className="text-white font-medium px-2 py-1 flex items-center gap-1 focus:outline-none w-full md:w-auto cursor-pointer"
              onClick={() => setOpenDropdown(openDropdown === 1 ? null : 1)}
            >
              About
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openDropdown === 1 && (
              <div className="absolute left-0 mt-2 w-40 rounded shadow-lg z-10" style={{ background: green }}>
                <Link to="/about-us" className="block px-4 py-2 text-white hover:bg-green-700 cursor-pointer" onClick={() => setOpenDropdown(null)}>About Us</Link>
                <Link to="/team" className="block px-4 py-2 text-white hover:bg-green-700 cursor-pointer" onClick={() => setOpenDropdown(null)}>Team</Link>
                <Link to="/history" className="block px-4 py-2 text-white hover:bg-green-700 cursor-pointer" onClick={() => setOpenDropdown(null)}>History</Link>
              </div>
            )}
          </div>
          {/* Dropdown 3 */}
          <div className="relative w-full md:w-auto" ref={dropdownRefs[2]}>
            <button
              className="text-white font-medium px-2 py-1 flex items-center gap-1 focus:outline-none w-full md:w-auto cursor-pointer"
              onClick={() => setOpenDropdown(openDropdown === 2 ? null : 2)}
            >
              Careers
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openDropdown === 2 && (
              <div className="absolute left-0 mt-2 w-40 rounded shadow-lg z-10" style={{ background: green }}>
                <Link to="/jobs" className="block px-4 py-2 text-white hover:bg-green-700 cursor-pointer" onClick={() => setOpenDropdown(null)}>Jobs</Link>
                <Link to="/internships" className="block px-4 py-2 text-white hover:bg-green-700 cursor-pointer" onClick={() => setOpenDropdown(null)}>Internships</Link>
                <Link to="/benefits" className="block px-4 py-2 text-white hover:bg-green-700 cursor-pointer" onClick={() => setOpenDropdown(null)}>Benefits</Link>
              </div>
            )}
          </div>
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