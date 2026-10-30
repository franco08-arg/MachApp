import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  isDniRegistered,
  isEmailRegistered,
  saveAccount,
} from '../services/accounts.js'
import { saveSession } from '../auth.js'

const TOTAL_STEPS = 2
const MAX_BIRTH_DATE = new Date().toISOString().slice(0, 10)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_REGEX = /^\d{8}$/

const INTERESTS = [
  'Música',
  'Deportes',
  'Viajes',
  'Tecnología',
  'Gastronomía',
  'Arte',
  'Cine',
  'Naturaleza',
  'Clima favorito',
]

const INITIAL_FORM = {
  nombres: '',
  apellidos: '',
  dni: '',
  fechaNacimiento: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
  privacy: false,
}

const INITIAL_PROFILE = { bio: '', interests: [] }

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100'

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
    <p className="mt-2 text-xs font-medium text-rose-600">{message}</p>
  ) : null

function Registro() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL_FORM)
  const [profile, setProfile] = useState(INITIAL_PROFILE)
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

  const toggleInterest = (interest) => {
    setProfile((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }))
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
      nextErrors.terms = 'Debes aceptar los Términos y condiciones.'
    }

    if (!form.privacy) {
      nextErrors.privacy = 'Debes aceptar la Política de privacidad.'
    }

    return nextErrors
  }

  const handleContinue = (event) => {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleFinish = (event) => {
    event.preventDefault()

    const email = form.email.trim().toLowerCase()

    saveAccount({
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      dni: form.dni.trim(),
      fechaNacimiento: form.fechaNacimiento,
      email,
      password: form.password,
      termsAcceptedAt: new Date().toISOString(),
      profile: {
        bio: profile.bio.trim(),
        interests: profile.interests,
      },
    })

    saveSession({ identifier: email, loggedAt: new Date().toISOString() })
    navigate('/gestionar', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-7 shadow-2xl shadow-slate-950/40 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              MatchApp
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {step === 1 ? 'Crear cuenta' : 'Completa tu perfil'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {step === 1
                ? 'Paso 1 de 2 · Verifica tus datos personales.'
                : 'Paso 2 de 2 · Cuéntanos sobre ti.'}
            </p>
          </div>
          <Link
            to="/"
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            Volver
          </Link>
        </div>

        <div className="mt-8 flex gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 flex-1 rounded-full ${
                index < step ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {step === 1 ? (
          <form noValidate onSubmit={handleContinue} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="nombres"
                  className="mb-2 block text-sm font-medium text-slate-700"
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
                  className="mb-2 block text-sm font-medium text-slate-700"
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

              <div>
                <label
                  htmlFor="dni"
                  className="mb-2 block text-sm font-medium text-slate-700"
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
                <p id="dni-help" className="mt-2 text-xs text-slate-400">
                  Solo se usa para verificar tu identidad y edad.
                </p>
                <FieldError message={errors.dni} />
              </div>

              <div>
                <label
                  htmlFor="fechaNacimiento"
                  className="mb-2 block text-sm font-medium text-slate-700"
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
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Correo electrónico
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

            <div className="grid gap-5 sm:grid-cols-2">
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
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirmar contraseña
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
            </div>

            <div className="space-y-3 rounded-xl bg-slate-50 px-4 py-4">
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="terms"
                  checked={form.terms}
                  onChange={updateField('terms')}
                  aria-invalid={Boolean(errors.terms)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  Acepto los{' '}
                  <span className="font-semibold text-indigo-600">
                    Términos y condiciones
                  </span>
                  .
                </span>
              </label>
              <FieldError message={errors.terms} />

              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="privacy"
                  checked={form.privacy}
                  onChange={updateField('privacy')}
                  aria-invalid={Boolean(errors.privacy)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  Acepto la{' '}
                  <span className="font-semibold text-indigo-600">
                    Política de privacidad
                  </span>
                  .
                </span>
              </label>
              <FieldError message={errors.privacy} />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              Continuar
            </button>

            <p className="text-center text-sm text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Inicia sesión
              </Link>
            </p>
          </form>
        ) : (
          <form noValidate onSubmit={handleFinish} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Sobre ti <span className="text-slate-400">(opcional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                maxLength={280}
                placeholder="Cuéntale a la comunidad qué te gusta hacer."
                value={profile.bio}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                }
                className={INPUT_CLASS}
              />
              <p className="mt-2 text-right text-xs text-slate-400">
                {profile.bio.length}/280
              </p>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">
                Intereses <span className="text-slate-400">(opcional)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const isSelected = profile.interests.includes(interest)

                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      aria-pressed={isSelected}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                      }`}
                    >
                      {interest}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 sm:w-auto sm:flex-1"
              >
                Atrás
              </button>
              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 sm:flex-1"
              >
                Finalizar registro
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

export default Registro
