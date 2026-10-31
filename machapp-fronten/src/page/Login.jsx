import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { saveSession } from '../auth.js'
import { getAccounts } from '../services/accounts.js'

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 5 * 60 * 1000
const DISCOVERY_PATH = '/descubrimiento'

const EMPTY_ERRORS = { identifier: '', password: '', form: '' }

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-60'

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

function Login({ accounts = getAccounts(), onSuccess }) {
  const navigate = useNavigate()
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

      const session = {
        identifier: identifier.trim(),
        loggedAt: new Date().toISOString(),
      }
      saveSession(session)

      if (onSuccess) {
        onSuccess(session)
      } else {
        navigate(DISCOVERY_PATH, { replace: true })
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#d9d9d9] px-4 py-10">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl shadow-black/40 sm:p-10">
        <div className="flex items-center gap-2 text-rose-500">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-6 w-6"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="text-2xl font-extrabold italic tracking-tight">
            MatchApp
          </span>
        </div>

        <h1 className="mt-7 text-3xl font-extrabold text-slate-900">
          Iniciar sesión
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Bienvenido de nuevo. Ingresa con tu cuenta.
        </p>

        <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="identifier"
              className="mb-1.5 block text-sm text-slate-600"
            >
              Correo electrónico o DNI
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              inputMode="email"
              autoComplete="username"
              placeholder="correo@ejemplo.com / 8 digitos"
              value={identifier}
              onChange={handleIdentifierChange}
              disabled={isLocked}
              aria-invalid={Boolean(errors.identifier)}
              aria-describedby={
                errors.identifier ? 'identifier-error' : undefined
              }
              className={INPUT_CLASS}
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
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm text-slate-600"
            >
              Contraseña
            </label>
            <div className="relative">
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
                className={`${INPUT_CLASS} pr-20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 transition hover:text-rose-500"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="mt-2 text-xs font-medium text-rose-600"
              >
                {errors.password}
              </p>
            )}
          </div>

          <div className="text-right">
            <Link
              to="/recuperar-contrasena"
              className="text-sm font-semibold text-rose-500 transition hover:text-rose-600"
            >
              ¿Olvidaste tu contraseña?
            </Link>
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
            className="w-full rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-rose-200 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            {isLocked ? 'Cuenta bloqueada temporalmente' : 'Ingresar'}
          </button>

          <p className="text-center text-xs leading-5 text-slate-400">
            {isLocked
              ? `Espera ${formatCountdown(secondsLeft)} para intentarlo de nuevo.`
              : 'Tras 5 intentos fallidos la cuenta se bloquea temporalmente.'}
          </p>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">¿Aún no tienes cuenta?</p>
          <Link
            to="/registro"
            className="mt-3 flex w-full items-center justify-center rounded-full border border-rose-400 px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Login
