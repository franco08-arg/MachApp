import { Link } from 'react-router-dom'

function RecuperarContrasena() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-slate-950/40">
        <h1 className="text-2xl font-bold text-slate-900">
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          La recuperación estará disponible cuando se conecte la API real.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </main>
  )
}

export default RecuperarContrasena
