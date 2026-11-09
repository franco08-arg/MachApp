import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  isDniRegistered,
  isEmailRegistered,
  saveAccount,
} from '../services/accounts.js'
import { saveSession } from '../auth.js'

const MAX_BIRTH_DATE = new Date().toISOString().slice(0, 10)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_REGEX = /^\d{8}$/

const INITIAL_FORM = {
  nombres: '',
  apellidos: '',
  dni: '',
  fechaNacimiento: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
}

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100'

const getAge = (value) => {
  if (!value) return null

  const birth = new Date(`${value}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  return age
}

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1.5 text-xs font-medium text-rose-600">{message}</p>
  ) : null

function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const updateField = (field) => (event) => {
    const { type, checked, value } = event.target
    setForm((current) => ({
      ...current,
      [field]: type === 'checkbox' ? checked : value,
    }))

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  const validate = () => {
    const nextErrors = {}
    const nombres = form.nombres.trim()
    const apellidos = form.apellidos.trim()
    const dni = form.dni.trim()
    const email = form.email.trim()

    if (!nombres) {
      nextErrors.nombres = 'Ingresa tus nombres.'
    } else if (nombres.length < 2) {
      nextErrors.nombres = 'Los nombres deben tener al menos 2 caracteres.'
    }

    if (!apellidos) {
      nextErrors.apellidos = 'Ingresa tus apellidos.'
    } else if (apellidos.length < 2) {
      nextErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres.'
    }

    if (!dni) {
      nextErrors.dni = 'Ingresa tu DNI.'
    } else if (!DNI_REGEX.test(dni)) {
      nextErrors.dni = 'El DNI debe tener exactamente 8 dígitos.'
    } else if (isDniRegistered(dni)) {
      nextErrors.dni = 'Este DNI ya está registrado.'
    }

    if (!form.fechaNacimiento) {
      nextErrors.fechaNacimiento = 'Ingresa tu fecha de nacimiento.'
    } else {
      const age = getAge(form.fechaNacimiento)

      if (age === null) {
        nextErrors.fechaNacimiento = 'Ingresa una fecha válida.'
      } else if (age < 0) {
        nextErrors.fechaNacimiento = 'La fecha no puede estar en el futuro.'
      } else if (age < 18) {
        nextErrors.fechaNacimiento =
          'Debes ser mayor de 18 años para registrarte.'
      }
    }

    if (!email) {
      nextErrors.email = 'Ingresa tu correo electrónico.'
    } else if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = 'Ingresa un correo electrónico válido.'
    } else if (isEmailRegistered(email)) {
      nextErrors.email = 'Este correo ya está registrado.'
    }

    if (!form.password) {
      nextErrors.password = 'Crea una contraseña.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirma tu contraseña.'
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }

    if (!form.terms) {
      nextErrors.terms =
        'Debes declarar que eres mayor de 18 años y aceptar los términos.'
    }

    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    const email = form.email.trim().toLowerCase()

    saveAccount({
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      dni: form.dni.trim(),
      fechaNacimiento: form.fechaNacimiento,
      email,
      password: form.password,
      termsAcceptedAt: new Date().toISOString(),
    })

    saveSession({
      identifier: email,
      role: 'user',
      loggedAt: new Date().toISOString(),
    })
    navigate('/completar-perfil', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#d9d9d9] px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white px-6 py-8 shadow-2xl shadow-black/40">
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

        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
          Crear cuenta
        </h1>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Paso 1 de 2 · Datos personales y verificación
        </p>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f]" />
        </div>

        <form noValidate onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="nombres"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Nombres
              </label>
              <input
                id="nombres"
                name="nombres"
                type="text"
                autoComplete="given-name"
                placeholder="Tus nombres"
                value={form.nombres}
                onChange={updateField('nombres')}
                aria-invalid={Boolean(errors.nombres)}
                className={INPUT_CLASS}
              />
              <FieldError message={errors.nombres} />
            </div>

            <div>
              <label
                htmlFor="apellidos"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Apellidos
              </label>
              <input
                id="apellidos"
                name="apellidos"
                type="text"
                autoComplete="family-name"
                placeholder="Tus apellidos"
                value={form.apellidos}
                onChange={updateField('apellidos')}
                aria-invalid={Boolean(errors.apellidos)}
                className={INPUT_CLASS}
              />
              <FieldError message={errors.apellidos} />
            </div>
          </div>

          <div>
            <label
              htmlFor="dni"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              DNI
            </label>
            <input
              id="dni"
              name="dni"
              type="text"
              inputMode="numeric"
              maxLength={8}
              autoComplete="off"
              placeholder="8 dígitos"
              value={form.dni}
              onChange={updateField('dni')}
              aria-invalid={Boolean(errors.dni)}
              aria-describedby="dni-help"
              className={INPUT_CLASS}
            />
            <p id="dni-help" className="mt-1.5 text-xs text-slate-400">
              Se usa solo para verificar identidad y edad
            </p>
            <FieldError message={errors.dni} />
          </div>

          <div>
            <label
              htmlFor="fechaNacimiento"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Fecha de nacimiento
            </label>
            <input
              id="fechaNacimiento"
              name="fechaNacimiento"
              type="date"
              max={MAX_BIRTH_DATE}
              value={form.fechaNacimiento}
              onChange={updateField('fechaNacimiento')}
              aria-invalid={Boolean(errors.fechaNacimiento)}
              className={INPUT_CLASS}
            />
            <FieldError message={errors.fechaNacimiento} />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={updateField('email')}
              aria-invalid={Boolean(errors.email)}
              className={INPUT_CLASS}
            />
            <FieldError message={errors.email} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-600"
              >
                Contraseña
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
              Confirmar
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              aria-invalid={Boolean(errors.confirmPassword)}
              className={INPUT_CLASS}
            />
            <FieldError message={errors.confirmPassword} />
          </div>

          <div>
            <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-600">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={updateField('terms')}
                aria-invalid={Boolean(errors.terms)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-400"
              />
              <span>
                Declaro ser mayor de 18 años y acepto los{' '}
                <span className="font-semibold text-rose-500">
                  Términos
                </span>{' '}
                y la{' '}
                <span className="font-semibold text-rose-500">
                  Política de privacidad
                </span>
                .
              </span>
            </label>
            <FieldError message={errors.terms} />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-rose-200"
          >
            Continuar
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-rose-500 hover:text-rose-600"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Registro
