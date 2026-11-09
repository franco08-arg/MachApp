import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../auth.js'
import { saveProfile } from '../services/accounts.js'

const MAX_INTERESTS = 5

const INTERESTS = [
  'Música',
  'Viajes',
  'Cine',
  'Deporte',
  'Cocina',
  'Arte',
  'Tecnología',
  'Naturaleza',
]

const INITIAL_PROFILE = {
  photo: '',
  gender: '',
  lookingFor: '',
  bio: '',
  interests: [],
  allowLocation: false,
}

const SELECT_CLASS =
  'w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100'

const LABEL_CLASS = 'mb-1.5 block text-xs font-semibold text-slate-600'

function CompletarPerfil() {
  const navigate = useNavigate()
  const [session] = useState(() => getSession())
  const [profile, setProfile] = useState(INITIAL_PROFILE)
  const [errors, setErrors] = useState({})

  const updateField = (field) => (event) => {
    const { type, checked, value } = event.target
    setProfile((current) => ({
      ...current,
      [field]: type === 'checkbox' ? checked : value,
    }))

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setProfile((current) => ({ ...current, photo: String(reader.result) }))
      setErrors((current) => ({ ...current, photo: '' }))
    }
    reader.readAsDataURL(file)
  }

  const toggleInterest = (interest) => {
    const isSelected = profile.interests.includes(interest)

    if (!isSelected && profile.interests.length >= MAX_INTERESTS) {
      setErrors((current) => ({
        ...current,
        interests: `Puedes elegir hasta ${MAX_INTERESTS} intereses.`,
      }))
      return
    }

    setProfile((current) => ({
      ...current,
      interests: isSelected
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }))

    if (errors.interests) {
      setErrors((current) => ({ ...current, interests: '' }))
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!profile.photo) {
      nextErrors.photo = 'Sube al menos una foto para continuar.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    saveProfile(session?.identifier, {
      photo: profile.photo,
      gender: profile.gender,
      lookingFor: profile.lookingFor,
      bio: profile.bio.trim(),
      interests: profile.interests,
      allowLocation: profile.allowLocation,
    })

    navigate('/descubrimiento', { replace: true })
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
          Completa tu perfil
        </h1>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Paso 2 de 2 · Así te verán los demás
        </p>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f]" />

        <form noValidate onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200">
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
                  className="h-9 w-9 text-slate-400"
                >
                  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z" />
                </svg>
              )}
            </div>

            <div>
              <label
                htmlFor="photo"
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-rose-300 bg-white px-4 py-2 text-xs font-semibold text-rose-500 transition hover:bg-rose-50"
              >
                Subir fotos (min. 1)
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
              />
              {errors.photo && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                  {errors.photo}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="gender" className={LABEL_CLASS}>
              Soy
            </label>
            <select
              id="gender"
              name="gender"
              value={profile.gender}
              onChange={updateField('gender')}
              className={`${SELECT_CLASS} ${
                profile.gender ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              <option value="" disabled>
                Mujer / Hombre / Otro
              </option>
              <option value="Mujer">Mujer</option>
              <option value="Hombre">Hombre</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="lookingFor" className={LABEL_CLASS}>
              Me interesa conocer
            </label>
            <select
              id="lookingFor"
              name="lookingFor"
              value={profile.lookingFor}
              onChange={updateField('lookingFor')}
              className={`${SELECT_CLASS} ${
                profile.lookingFor ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              <option value="" disabled>
                Mujeres / Hombres / Todos
              </option>
              <option value="Mujeres">Mujeres</option>
              <option value="Hombres">Hombres</option>
              <option value="Todos">Todos</option>
            </select>
          </div>

          <div>
            <label htmlFor="bio" className={LABEL_CLASS}>
              Biografía
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={280}
              placeholder="Cuéntanos algo sobre ti"
              value={profile.bio}
              onChange={updateField('bio')}
              className={`${SELECT_CLASS} resize-none`}
            />
          </div>

          <div>
            <p className={LABEL_CLASS}>
              Intereses (elige hasta {MAX_INTERESTS})
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
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
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
            {errors.interests && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">
                {errors.interests}
              </p>
            )}
          </div>

          <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-600">
            <input
              type="checkbox"
              name="allowLocation"
              checked={profile.allowLocation}
              onChange={updateField('allowLocation')}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-400"
            />
            <span>Permitir usar mi ubicación para mostrar personas cercanas.</span>
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-rose-200"
          >
            Finalizar y empezar a deslizar
          </button>
        </form>
      </div>
    </main>
  )
}

export default CompletarPerfil
