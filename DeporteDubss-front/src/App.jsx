import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import PerfilPage from "./pages/PerfilPage.jsx"
import Navbar from "./components/navbar/Navbar.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import ProtectedRoute from "./components/ProtectedRoute"
import CampeonatosPage from "./pages/CampeonatosPage.jsx"
import RolPermisos from "./pages/RolPermisos.jsx"
import InstalacionesPage from "./pages/InstalacionesPage.jsx"
import EquipoPage from "./pages/EquipoPage.jsx"
import RegisterPage from "./pages/RegisterPage.jsx"
import CategoriaPage from "./pages/CategoriaPage.jsx"
import DeportePage from "./pages/DeportePage.jsx"
import Home from "./pages/Home.jsx"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          {/* Ruta protegida solo para admin: registro de usuario */}
          <Route
            path="/dashboard/:id/registrar-usuario"
            element={
              <ProtectedRoute>
                <RegisterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:id"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Ejemplo de otra ruta privada */}
          
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <PerfilPage />
              </ProtectedRoute>
            }
          />
       
          <Route
            path="/instalaciones"
            element={
              <ProtectedRoute>
                <InstalacionesPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/equipo"
            element={
              <ProtectedRoute>
                <EquipoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campeonatos"
            element={
              <ProtectedRoute>
                <CampeonatosPage />
              </ProtectedRoute>
            }
          />
          
         
          <Route
            path="/rol-permisos"
            element={
              <ProtectedRoute>
                <RolPermisos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute>
                <CategoriaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deportes"
            element={
              <ProtectedRoute>
                <DeportePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
