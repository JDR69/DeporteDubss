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
    email: null
  });

  const signin = async (email, password) => {
    try {
      setLoading(true); 
      // Simulamos un retraso de autenticación (podrías reemplazar esto con una llamada API real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Creamos el objeto de usuario
      const userData = {
        id: 1,
        email: email,
      };
      
      // Guardamos en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Actualizamos el estado
      setUser(userData);
      
      // Navegamos DESPUÉS de actualizar el estado, usando el ID directo
      // navigate(`/dashboard/${userData.id}`);
      navigate('/perfil')
      
      return true;
    } catch (error) {
      console.error("Error during sign-in:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    const checkLogin = async () => {
      setLoading(true);
      try {
        const savedUser = localStorage.getItem('user');
        
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          console.log("Usuario cargado desde localStorage:", userData);
        } else {
          console.log("No hay usuario guardado en localStorage");
        }
      } catch (err) {
        console.error("Error al cargar usuario desde localStorage", err);
        localStorage.removeItem('user'); // Eliminar datos corruptos
        setUser({
          id: null,
          email: null,
        });
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('user');
    setUser({
      id: null,
      email: null,
    });
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signin,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
