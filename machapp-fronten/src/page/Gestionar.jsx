import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSession } from '../auth.js'
import { getProfile, saveProfile } from '../services/accounts.js'

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
  'w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100'

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-2 text-xs font-medium text-rose-600">{message}</p>
  ) : null

function Gestionar() {
  const navigate = useNavigate()
  const [session] = useState(() => getSession())
  const [profile, setProfile] = useState(() => {
    const stored = getProfile(session?.identifier)
    return {
      ...INITIAL_PROFILE,
      ...stored,
      interests: Array.isArray(stored?.interests) ? stored.interests : [],
      location: stored?.location ?? null,
    }
  })
  const [isEditing] = useState(() =>
    Boolean(getProfile(session?.identifier)?.gender),
  )
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

  const handleSubmit = (event) => {
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

    navigate('/descubrimiento', { replace: true })
  }

  const locationMessage = {
    idle: 'Activa tu ubicación para mostrarte personas y planes cercanos.',
    loading: 'Solicitando permiso de ubicación…',
    granted: 'Ubicación activada. Verás personas cercanas en tu feed.',
    denied: locationError,
    unsupported: locationError,
  }[locationStatus]

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-7 shadow-2xl shadow-slate-950/40 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              MatchApp
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {isEditing ? 'Perfil y ajustes' : 'Completa tu perfil'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isEditing
                ? 'Actualiza cómo te presentas y a quién quieres conocer.'
                : 'Cuéntanos un poco sobre ti para empezar a descubrir personas.'}
            </p>
          </div>
          <Link
            to="/descubrimiento"
            className="self-start rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            Volver al feed
          </Link>
        </div>

        <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-7">
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-700">
              Género
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
                    className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
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
            <legend className="mb-3 text-sm font-medium text-slate-700">
              Quiero conocer a
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
                    className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
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
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Biografía <span className="text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={280}
              placeholder="Cuéntale a la comunidad qué te gusta hacer."
              value={profile.bio}
              onChange={(event) => updateField('bio')(event.target.value)}
              className={INPUT_CLASS}
            />
            <p className="mt-2 text-right text-xs text-slate-400">
              {profile.bio.length}/280
            </p>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-700">
                Intereses <span className="text-slate-400">(hasta 5)</span>
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
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                    } disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300`}
                  >
                    {interest}
                  </button>
                )
              })}
            </div>
            <FieldError message={errors.interests} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
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
                className="shrink-0 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:border-indigo-400 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
            <Link
              to="/descubrimiento"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 sm:flex-1"
            >
              Omitir por ahora
            </Link>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 sm:flex-1"
            >
              {isEditing
                ? 'Guardar cambios y volver al feed'
                : 'Finalizar y empezar a deslizar'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Gestionar
