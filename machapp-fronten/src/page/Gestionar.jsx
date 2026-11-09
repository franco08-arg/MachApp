import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav.jsx'
import { clearSession, getSession } from '../auth.js'
import { findAccount, getProfile, saveProfile } from '../services/accounts.js'

const GENDERS = ['Mujer', 'Hombre', 'Otro']
const LOOKING_FOR = ['Mujeres', 'Hombres', 'Todos']
const INTERESTS = ['Música', 'Viajes', 'Cine', 'Deporte', 'Cocina']
const MAX_INTERESTS = 5

const INITIAL_PROFILE = {
  gender: '',
  lookingFor: '',
  bio: '',
  interests: [],
  location: null,
}

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100'

const CHIP_CLASS =
  'rounded-full border px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300'

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1.5 text-xs font-medium text-rose-600">{message}</p>
  ) : null

const EmptyValue = ({ children }) => (
  <span className="text-xs text-slate-400">{children}</span>
)

function Gestionar() {
  const navigate = useNavigate()
  const [session] = useState(() => getSession())
  const [account] = useState(() => findAccount(session?.identifier))
  const [profile, setProfile] = useState(() => {
    const stored = getProfile(session?.identifier)
    return {
      ...INITIAL_PROFILE,
      ...stored,
      interests: Array.isArray(stored?.interests) ? stored.interests : [],
      location: stored?.location ?? null,
    }
  })
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})
  const [locationStatus, setLocationStatus] = useState(
    profile.location ? 'granted' : 'idle',
  )
  const [locationError, setLocationError] = useState('')

  const updateField = (field) => (value) => {
    setProfile((current) => ({ ...current, [field]: value }))

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  const toggleInterest = (interest) => {
    setProfile((current) => {
      if (current.interests.includes(interest)) {
        return {
          ...current,
          interests: current.interests.filter((item) => item !== interest),
        }
      }

      if (current.interests.length >= MAX_INTERESTS) return current

      return { ...current, interests: [...current.interests, interest] }
    })

    if (errors.interests) {
      setErrors((current) => ({ ...current, interests: '' }))
    }
  }

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('unsupported')
      setLocationError('Tu navegador no permite usar la ubicación.')
      return
    }

    setLocationStatus('loading')
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfile((current) => ({
          ...current,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }))
        setLocationStatus('granted')
      },
      (error) => {
        setLocationStatus('denied')
        setLocationError(
          error.code === 1
            ? 'No diste permiso para usar tu ubicación. Puedes activarla cuando quieras.'
            : 'No pudimos obtener tu ubicación. Verifica tu conexión e inténtalo de nuevo.',
        )
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const handleEdit = () => {
    setSaved(false)
    setErrors({})
    setIsEditing(true)
  }

  const handleCancel = () => {
    const stored = getProfile(session?.identifier)
    setProfile({
      ...INITIAL_PROFILE,
      ...stored,
      interests: Array.isArray(stored?.interests) ? stored.interests : [],
      location: stored?.location ?? null,
    })
    setLocationStatus(stored?.location ? 'granted' : 'idle')
    setLocationError('')
    setErrors({})
    setIsEditing(false)
  }

  const handleSave = (event) => {
    event.preventDefault()

    const nextErrors = {}

    if (!profile.gender) {
      nextErrors.gender = 'Elige tu género.'
    }

    if (!profile.lookingFor) {
      nextErrors.lookingFor = 'Elige a quién quieres conocer.'
    }

    if (profile.interests.length > MAX_INTERESTS) {
      nextErrors.interests = `Puedes elegir hasta ${MAX_INTERESTS} intereses.`
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    saveProfile(session?.identifier, {
      gender: profile.gender,
      lookingFor: profile.lookingFor,
      bio: profile.bio.trim(),
      interests: profile.interests,
      location: profile.location,
    })

    setSaved(true)
    setIsEditing(false)
  }

  const handleLogout = () => {
    clearSession()
    navigate('/', { replace: true })
  }

  const locationMessage = {
    idle: 'Activa tu ubicación para mostrarte personas y planes cercanos.',
    loading: 'Solicitando permiso de ubicación…',
    granted: 'Ubicación activada. Verás personas cercanas en tu feed.',
    denied: locationError,
    unsupported: locationError,
  }[locationStatus]

  const fullName =
    [account?.nombres, account?.apellidos].filter(Boolean).join(' ') ||
    'Usuario MatchApp'

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
          {isEditing ? (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500"
            >
              Cancelar
            </button>
          ) : (
            <Link
              to="/ajustes"
              aria-label="Ajustes"
              title="Ajustes"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition hover:border-rose-400 hover:text-rose-500"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path d="M19.14 12.94a7.14 7.14 0 0 0 .06-.94 7.14 7.14 0 0 0-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.3 7.3 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54a7.3 7.3 0 0 0-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.74 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.14 7.14 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .61.22l2.39-.96a7.3 7.3 0 0 0 1.62.94l.36 2.54a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.54a7.3 7.3 0 0 0 1.62-.94l2.39.96a.5.5 0 0 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64ZM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Z" />
              </svg>
            </Link>
          )}
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
          {isEditing ? 'Editar perfil' : 'Perfil y ajustes'}
        </h1>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {isEditing
            ? 'Actualiza cómo te presentas y a quién quieres conocer.'
            : 'Así te verán los demás en MatchApp.'}
        </p>

        {saved && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700"
          >
            Cambios guardados correctamente.
          </p>
        )}

        {!isEditing ? (
          <div className="mt-5 space-y-4">
            <section className="rounded-2xl bg-white p-4 shadow-lg shadow-slate-400/20">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-8 w-8 text-slate-400"
                  >
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z" />
                  </svg>
                )}
              </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {fullName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {session?.identifier}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl bg-white p-4 shadow-lg shadow-slate-400/20">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-xs font-semibold text-slate-600">Soy</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {profile.gender || <EmptyValue>Sin definir</EmptyValue>}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">
                  Me interesa conocer
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {profile.lookingFor || (
                    <EmptyValue>Sin definir</EmptyValue>
                  )}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600">Biografía</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {profile.bio || (
                  <EmptyValue>Aún no has escrito una biografía.</EmptyValue>
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600">Intereses</p>
              {profile.interests.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-500"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  Todavía no elegiste intereses.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs font-semibold text-slate-600">Ubicación</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  profile.location
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {profile.location ? 'Activada' : 'No activada'}
              </span>
            </div>
            </section>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleEdit}
                className="w-full rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-rose-200"
              >
                Editar perfil
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-full border border-slate-300 px-4 py-3.5 text-sm font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={handleSave}
            className="mt-5 space-y-5 rounded-2xl bg-white p-5 shadow-lg shadow-slate-400/20"
          >
            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-slate-600">
                Soy
              </legend>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((gender) => {
                  const isSelected = profile.gender === gender

                  return (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => updateField('gender')(gender)}
                      aria-pressed={isSelected}
                      className={`${CHIP_CLASS} ${
                        isSelected
                          ? 'border-rose-400 bg-rose-500 text-white'
                          : 'border-rose-300 bg-white text-rose-500 hover:bg-rose-50'
                      }`}
                    >
                      {gender}
                    </button>
                  )
                })}
              </div>
              <FieldError message={errors.gender} />
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-slate-600">
                Me interesa conocer
              </legend>
              <div className="flex flex-wrap gap-2">
                {LOOKING_FOR.map((option) => {
                  const isSelected = profile.lookingFor === option

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateField('lookingFor')(option)}
                      aria-pressed={isSelected}
                      className={`${CHIP_CLASS} ${
                        isSelected
                          ? 'border-rose-400 bg-rose-500 text-white'
                          : 'border-rose-300 bg-white text-rose-500 hover:bg-rose-50'
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              <FieldError message={errors.lookingFor} />
            </fieldset>

            <div>
              <label
                htmlFor="bio"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Biografía
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={280}
                placeholder="Cuéntanos algo sobre ti"
                value={profile.bio}
                onChange={(event) => updateField('bio')(event.target.value)}
                className={`${INPUT_CLASS} resize-none`}
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {profile.bio.length}/280
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold text-slate-600">
                  Intereses (elige hasta {MAX_INTERESTS})
                </p>
                <span className="text-xs font-semibold text-slate-400">
                  {profile.interests.length}/{MAX_INTERESTS}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const isSelected = profile.interests.includes(interest)
                  const isDisabled =
                    !isSelected && profile.interests.length >= MAX_INTERESTS

                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      disabled={isDisabled}
                      aria-pressed={isSelected}
                      className={`${CHIP_CLASS} ${
                        isSelected
                          ? 'border-rose-400 bg-rose-500 text-white'
                          : 'border-rose-300 bg-white text-rose-500 hover:bg-rose-50'
                      }`}
                    >
                      {interest}
                    </button>
                  )
                })}
              </div>
              <FieldError message={errors.interests} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Ubicación
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {locationMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={locationStatus === 'loading'}
                  className="shrink-0 rounded-full border border-rose-300 bg-white px-4 py-2 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {locationStatus === 'granted'
                    ? 'Actualizar ubicación'
                    : locationStatus === 'loading'
                      ? 'Solicitando…'
                      : 'Permitir ubicación'}
                </button>
              </div>
              {locationStatus === 'denied' && locationError && (
                <p
                  role="alert"
                  className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
                >
                  {locationError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full rounded-full border border-slate-300 px-4 py-3.5 text-sm font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500 sm:flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-rose-200 sm:flex-1"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        )}
      </div>

      <BottomNav />
    </main>
  )
}

export default Gestionar
