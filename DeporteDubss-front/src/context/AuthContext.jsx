import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    id: null,
    email: null,
    rol: null // "admin" o "delegado"
  });

  const signin = async (email, password) => {
    try {
      setLoading(true); 
      
      // Llamada real al API de login
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: email,
          contrasena: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en el login');
      }

      const data = await response.json();
      
      // Guardar tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Crear objeto de usuario
      const userData = {
        id: data.usuario.id,
        email: data.usuario.Correo,
        nombre: data.usuario.Nombre,
        apellido: data.usuario.Apellido,
        rol: data.usuario.IDRol
      };
      
      // Guardar usuario en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Actualizar estado
      setUser(userData);
      
      // Navegar al perfil o dashboard
      navigate('/perfil');
      
      return true;
    } catch (error) {
      console.error("Error during sign-in:", error);
      alert(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      return false;
    } finally {
      setLoading(false);
    }
  }


  const signout = async () => {
    try {
      setLoading(true);
      
      // Llamar al endpoint de logout si existe
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch('http://127.0.0.1:8000/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).catch(err => console.log('Error en logout:', err));
      }
    } catch (error) {
      console.error("Error durante signout:", error);
    } finally {
      // Limpiar localStorage y estado
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser({ id: null, email: null, nombre: null, apellido: null, rol: null });
      navigate('/');
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      setLoading(true);
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        
        if (savedUser && token) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          console.log("Usuario cargado desde localStorage:", userData);
        } else {
          console.log("No hay usuario guardado en localStorage");
        }
      } catch (err) {
        console.error("Error al cargar usuario desde localStorage", err);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser({
          id: null,
          email: null,
          nombre: null,
          apellido: null,
          rol: null
        });
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // Función para cerrar sesión (alias de signout)
  const logout = () => {
    signout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signin,
        signout,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
