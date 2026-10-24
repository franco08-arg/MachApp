import { useEffect, useState } from 'react'

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 5 * 60 * 1000
const DISCOVERY_PATH = '/descubrimiento'

const DEMO_ACCOUNTS = [
  {
    email: 'demo@machapp.pe',
    dni: '12345678',
    password: 'machapp123',
  },
]

const EMPTY_ERRORS = { identifier: '', password: '', form: '' }

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const isDni = (value) => /^\d{8}$/.test(value)

const matchesIdentifier = (account, identifier) => {
  const value = identifier.trim().toLowerCase()
  return account.email.toLowerCase() === value || account.dni === value
}

const formatCountdown = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function Login({ accounts = DEMO_ACCOUNTS, onSuccess }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState(EMPTY_ERRORS)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  const isLocked = lockedUntil > now
  const secondsLeft = isLocked ? Math.ceil((lockedUntil - now) / 1000) : 0

  useEffect(() => {
    if (!lockedUntil) return undefined

    const interval = window.setInterval(() => {
      if (Date.now() >= lockedUntil) {
        window.clearInterval(interval)
        setNow(lockedUntil)
        return
      }
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [lockedUntil])

  const validate = () => {
    const nextErrors = { ...EMPTY_ERRORS }
    const value = identifier.trim()

    if (!value) {
      nextErrors.identifier = 'Ingresa tu correo o DNI.'
    } else if (!isEmail(value) && !isDni(value)) {
      nextErrors.identifier = 'Ingresa un correo válido o un DNI de 8 dígitos.'
    }

    if (!password) {
      nextErrors.password = 'Ingresa tu contraseña.'
    } else if (password.length < 8) {
      nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    return nextErrors
  }

  const handleIdentifierChange = (event) => {
    setIdentifier(event.target.value)
    if (errors.identifier || errors.form) {
      setErrors((current) => ({ ...current, identifier: '', form: '' }))
    }
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
    if (errors.password || errors.form) {
      setErrors((current) => ({ ...current, password: '', form: '' }))
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (isLocked) return

    const nextErrors = validate()
    setErrors(nextErrors)

    if (nextErrors.identifier || nextErrors.password) return

    const account = accounts.find((item) => matchesIdentifier(item, identifier))

    if (account && account.password === password) {
      setFailedAttempts(0)
      setLockedUntil(0)
      setErrors(EMPTY_ERRORS)

      if (onSuccess) {
        onSuccess({ identifier: identifier.trim() })
      } else {
        window.location.assign(DISCOVERY_PATH)
      }
      return
    }

    const expiredLock = lockedUntil > 0 && Date.now() >= lockedUntil
    const previousAttempts = expiredLock ? 0 : failedAttempts
    const attempts = previousAttempts + 1

    if (attempts >= MAX_ATTEMPTS) {
      setFailedAttempts(attempts)
      setLockedUntil(Date.now() + LOCK_DURATION_MS)
      setNow(Date.now())
      setErrors(EMPTY_ERRORS)
      return
    }

    setFailedAttempts(attempts)
    setLockedUntil(0)
    setErrors({
      ...EMPTY_ERRORS,
      form: `Correo/DNI o contraseña incorrectos. Te ${
        MAX_ATTEMPTS - attempts === 1 ? 'queda' : 'quedan'
      } ${MAX_ATTEMPTS - attempts} intento${
        MAX_ATTEMPTS - attempts === 1 ? '' : 's'
      }.`,
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/40 lg:grid-cols-[1.05fr_1fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white lg:flex">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-fuchsia-300/20 blur-2xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              MachApp
            </span>
            <h1 className="mt-8 text-4xl font-bold leading-tight">
              Tu cuenta, todas tus conexiones.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-indigo-100">
              Inicia sesión para descubrir personas, intereses y experiencias
              cerca de ti.
            </p>
          </div>

          <ul className="relative space-y-3 text-sm text-indigo-100">
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                ✓
              </span>
              Accede con tu correo o DNI
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                ✓
              </span>
              Descubre nuevas personas
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                ✓
              </span>
              Gestiona tu perfil en un solo lugar
            </li>
          </ul>
        </section>

        <section className="p-7 sm:p-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Bienvenido de nuevo
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Usa tu correo electrónico o DNI para continuar.
            </p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Correo electrónico o DNI
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder="tu@correo.com o 12345678"
                value={identifier}
                onChange={handleIdentifierChange}
                disabled={isLocked}
                aria-invalid={Boolean(errors.identifier)}
                aria-describedby={
                  errors.identifier ? 'identifier-error' : undefined
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              {errors.identifier && (
                <p
                  id="identifier-error"
                  className="mt-2 text-xs font-medium text-rose-600"
                >
                  {errors.identifier}
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLocked}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-2 text-xs font-medium text-rose-600"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {(errors.form || isLocked) && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                <p className="font-semibold">No pudimos iniciar sesión</p>
                {isLocked ? (
                  <>
                    <p className="mt-1">
                      Cuenta bloqueada temporalmente por demasiados intentos
                      fallidos.
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-rose-600">
                      Espera {formatCountdown(secondsLeft)} para intentarlo de
                      nuevo
                    </p>
                  </>
                ) : (
                  <p className="mt-1">{errors.form}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLocked}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {isLocked ? 'Cuenta bloqueada temporalmente' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <a
              href="#/recuperar-contrasena"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              ¿Olvidaste tu contraseña?
            </a>
            <a
              href="#/registro"
              className="font-semibold text-slate-700 hover:text-slate-900"
            >
              Crear cuenta
            </a>
          </div>

          <div className="mt-8 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
            <p className="font-semibold text-slate-600">
              Credenciales de demostración
            </p>
            <p>Correo: demo@machapp.pe · DNI: 12345678</p>
            <p>Contraseña: machapp123</p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login
