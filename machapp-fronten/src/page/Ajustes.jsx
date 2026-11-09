import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav.jsx'
import { clearSession, getSession } from '../auth.js'
import { findAccount, updateAccountPassword } from '../services/accounts.js'

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100'

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1.5 text-xs font-medium text-rose-600">{message}</p>
  ) : null

function Ajustes() {
  const navigate = useNavigate()
  const [session] = useState(() => getSession())
  const [account] = useState(() => findAccount(session?.identifier))
  const [form, setForm] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setSaved(false)

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!account) {
      setErrors({ currentPassword: 'No encontramos tu cuenta.' })
      return
    }

    const nextErrors = {}

    if (!form.currentPassword) {
      nextErrors.currentPassword = 'Ingresa tu contraseña actual.'
    } else if (account && form.currentPassword !== account.password) {
      nextErrors.currentPassword = 'La contraseña actual no es correcta.'
    }

    if (!form.password) {
      nextErrors.password = 'Ingresa tu nueva contraseña.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    } else if (form.password === form.currentPassword) {
      nextErrors.password = 'La nueva contraseña debe ser diferente.'
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirma tu nueva contraseña.'
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    updateAccountPassword(account.email, form.password)
    setForm({ currentPassword: '', password: '', confirmPassword: '' })
    setSaved(true)
  }

  const handleLogout = () => {
    clearSession()
    navigate('/', { replace: true })
  }

  return (
    <main className="min-h-screen bg-[#d9d9d9] pb-24">
      <div className="mx-auto w-full max-w-md px-4 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-rose-500">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-lg font-extrabold italic tracking-tight">
              MatchApp
            </span>
          </div>
          <Link
            to="/gestionar"
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500"
          >
            Volver
          </Link>
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Ajustes</h1>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Administra tu cuenta, tu seguridad y tus preferencias.
        </p>

        {saved && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700"
          >
            Contraseña actualizada correctamente.
          </p>
        )}

        <section className="mt-5 rounded-2xl bg-white p-5 shadow-lg shadow-slate-400/20">
          <h2 className="text-sm font-bold text-slate-900">
            Cambiar contraseña
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Usa una contraseña de al menos 8 caracteres que no uses en otras
            cuentas.
          </p>

          <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Contraseña actual
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Tu contraseña actual"
                value={form.currentPassword}
                onChange={updateField('currentPassword')}
                aria-invalid={Boolean(errors.currentPassword)}
                className={INPUT_CLASS}
              />
              <FieldError message={errors.currentPassword} />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-600"
                >
                  Nueva contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={updateField('password')}
                aria-invalid={Boolean(errors.password)}
                className={INPUT_CLASS}
              />
              <FieldError message={errors.password} />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repite tu nueva contraseña"
                value={form.confirmPassword}
                onChange={updateField('confirmPassword')}
                aria-invalid={Boolean(errors.confirmPassword)}
                className={INPUT_CLASS}
              />
              <FieldError message={errors.confirmPassword} />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              Guardar contraseña
            </button>
          </form>
        </section>

        <section className="mt-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-400/20">
          <h2 className="text-sm font-bold text-slate-900">
            Preferencias de búsqueda
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Ajusta la edad y la distancia de las personas que quieres ver en
            Descubrir.
          </p>
          <Link
            to="/preferencias"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-rose-300 bg-white px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
          >
            Editar preferencias
          </Link>
        </section>

        <section className="mt-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-400/20">
          <h2 className="text-sm font-bold text-slate-900">Cuenta</h2>
          <p className="mt-1 text-xs text-slate-500">
            {account?.email ?? session?.identifier}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500"
          >
            Cerrar sesión
          </button>
        </section>
      </div>

      <BottomNav />
    </main>
  )
}

export default Ajustes
