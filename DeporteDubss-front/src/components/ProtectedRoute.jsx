import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  // Si no hay usuario autenticado, redirige a login
  console.log("ProtectedRoute - user:", user);
  if (!user ) {
    return <Navigate to="/" replace />;
  }
  // Si está autenticado, muestra el contenido protegido
  return children;
};

export default ProtectedRoute;
