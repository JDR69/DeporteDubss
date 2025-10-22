import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import PerfilPage from "./pages/PerfilPage.jsx"
import Navbar from "./componentes/navbar/Navbar.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import ProtectedRoute from "./componentes/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
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
         
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
