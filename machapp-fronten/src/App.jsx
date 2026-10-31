import { Navigate, Route, Routes } from 'react-router-dom'
import Interfaz from './page/Interfaz.jsx'
import Login from './page/Login.jsx'
import Descubrimiento from './page/Descubrimiento.jsx'
import Registro from './page/Registro.jsx'
import RecuperarContrasena from './page/RecuperarContrasena.jsx'
import Gestionar from './page/Gestionar.jsx'
import PreferenciasBusqueda from './page/PreferenciasBusqueda.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Interfaz />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route
          path="/gestionar"
          element={
            <ProtectedRoute>
              <Gestionar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/descubrimiento"
          element={
            <ProtectedRoute>
              <Descubrimiento />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preferencias"
          element={
            <ProtectedRoute>
              <PreferenciasBusqueda />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
