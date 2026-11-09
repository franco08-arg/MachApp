import { Navigate, Route, Routes } from 'react-router-dom'
import Interfaz from './page/Interfaz.jsx'
import Login from './page/Login.jsx'
import Descubrimiento from './page/Descubrimiento.jsx'
import Matches from './page/Matches.jsx'
import Chat from './page/Chat.jsx'
import Chats from './page/Chats.jsx'
import Registro from './page/Registro.jsx'
import CompletarPerfil from './page/CompletarPerfil.jsx'
import RecuperarContrasena from './page/RecuperarContrasena.jsx'
import Gestionar from './page/Gestionar.jsx'
import PreferenciasBusqueda from './page/PreferenciasBusqueda.jsx'
import Ajustes from './page/Ajustes.jsx'
import UsuariosReportados from './page/UsuariosReportados.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Interfaz />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/completar-perfil"
          element={
            <ProtectedRoute>
              <CompletarPerfil />
            </ProtectedRoute>
          }
        />
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
          path="/matches"
          element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:personId"
          element={
            <ProtectedRoute>
              <Chat />
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
          path="/ajustes"
          element={
            <ProtectedRoute>
              <Ajustes />
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
        <Route
          path="/admin/reportes"
          element={
            <AdminRoute>
              <UsuariosReportados />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
