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
import UsuariosPage from "./pages/UsuariosPage.jsx"
import FixturesPage from "./pages/FixturesPage.jsx"
import ResultadosPage from "./pages/ResultadosPage.jsx"
import PartidosPage from "./pages/PartidosPage.jsx"
import HistorialPage from "./pages/HistorialPage.jsx"
import IncidenciasPage from "./pages/IncidenciasPage.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import OrganizadorDashboard from "./pages/OrganizadorDashboard.jsx"
import DelegadoDashboard from "./pages/DelegadoDashboard.jsx"
import CalendarioPage from "./pages/CalendarioPage.jsx"
import BitacoraPage from "./pages/BitacoraPage.jsx"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          
          {/* Dashboards por rol */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/organizador"
            element={
              <ProtectedRoute>
                <OrganizadorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/delegado"
            element={
              <ProtectedRoute>
                <DelegadoDashboard />
              </ProtectedRoute>
            }
          />
          
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
            path="/calendario"
            element={
              <ProtectedRoute>
                <CalendarioPage />
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
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <UsuariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fixtures"
            element={
              <ProtectedRoute>
                <FixturesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resultados"
            element={
              <ProtectedRoute>
                <ResultadosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partidos"
            element={
              <ProtectedRoute>
                <PartidosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial"
            element={
              <ProtectedRoute>
                <HistorialPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidencias"
            element={
              <ProtectedRoute>
                <IncidenciasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bitacora"
            element={
              <ProtectedRoute>
                <BitacoraPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
