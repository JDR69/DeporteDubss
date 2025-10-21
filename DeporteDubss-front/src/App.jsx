import { BrowserRouter,Routes,Route  } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import Navbar from "./componentes/navbar/Navbar.jsx"

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
