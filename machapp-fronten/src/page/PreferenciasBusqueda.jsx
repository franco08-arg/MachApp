import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSession } from '../auth.js'
import {
  AGE_MAX,
  AGE_MIN,
  DEFAULT_PREFERENCES,
  DISTANCE_MAX,
  DISTANCE_MIN,
  getPreferences,
  savePreferences,
} from '../services/preferences.js'

const THUMB_CLASS =
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-indigo-600 [&::-moz-range-thumb]:shadow-md'

const percent = (value, min, max) => ((value - min) / (max - min)) * 100

function PreferenciasBusqueda() {
  const navigate = useNavigate()
  const [session] = useState(() => getSession())
  const [preferences, setPreferences] = useState(() =>
    getPreferences(session?.identifier),
  )

  const updatePreference = (field) => (event) => {
    const value = Number(event.target.value)

    setPreferences((current) => {
      if (field === 'minAge') {
        return { ...current, minAge: Math.min(value, current.maxAge) }
      }

      if (field === 'maxAge') {
        return { ...current, maxAge: Math.max(value, current.minAge) }
      }

      return { ...current, [field]: value }
    })
  }

  const handleReset = () => {
    setPreferences({ ...DEFAULT_PREFERENCES })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    savePreferences(session?.identifier, preferences)
    navigate('/descubrimiento', { state: { preferencesSaved: true } })
  }

  const ageLeft = percent(preferences.minAge, AGE_MIN, AGE_MAX)
  const ageRight = percent(preferences.maxAge, AGE_MIN, AGE_MAX)
  const distancePercent = percent(
    preferences.maxDistance,
    DISTANCE_MIN,
    DISTANCE_MAX,
  )

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-7 shadow-2xl shadow-slate-950/40 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              MatchApp
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Preferencias de búsqueda
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Ajusta la edad y la distancia para decidir qué perfiles aparecen
              en tu feed de descubrimiento.
            </p>
          </div>
          <Link
            to="/descubrimiento"
            className="self-start rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            Volver al feed
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Rango de edad
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Edad mínima: {preferences.minAge} años · Edad máxima:{' '}
                  {preferences.maxAge} años
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
                {preferences.minAge} – {preferences.maxAge} años
              </span>
            </div>

            <div className="relative mt-6 h-6">
              <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
              <div
                className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-indigo-600"
                style={{ left: `${ageLeft}%`, right: `${100 - ageRight}%` }}
              />
              <input
                type="range"
                min={AGE_MIN}
                max={AGE_MAX}
                step={1}
                value={preferences.minAge}
                onChange={updatePreference('minAge')}
                aria-label="Edad mínima"
                aria-valuetext={`${preferences.minAge} años`}
                className={`pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent ${THUMB_CLASS}`}
              />
              <input
                type="range"
                min={AGE_MIN}
                max={AGE_MAX}
                step={1}
                value={preferences.maxAge}
                onChange={updatePreference('maxAge')}
                aria-label="Edad máxima"
                aria-valuetext={`${preferences.maxAge} años`}
                className={`pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent ${THUMB_CLASS}`}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs font-medium text-slate-400">
              <span>{AGE_MIN} años</span>
              <span>{AGE_MAX} años</span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Distancia máxima
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Solo verás personas dentro de este radio.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
                {preferences.maxDistance} km
              </span>
            </div>

            <div className="relative mt-6 h-6">
              <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
              <div
                className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-indigo-600"
                style={{ left: 0, width: `${distancePercent}%` }}
              />
              <input
                type="range"
                min={DISTANCE_MIN}
                max={DISTANCE_MAX}
                step={1}
                value={preferences.maxDistance}
                onChange={updatePreference('maxDistance')}
                aria-label="Distancia máxima en kilómetros"
                aria-valuetext={`${preferences.maxDistance} kilómetros`}
                className={`pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent ${THUMB_CLASS}`}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs font-medium text-slate-400">
              <span>{DISTANCE_MIN} km</span>
              <span>{DISTANCE_MAX} km</span>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 sm:flex-1"
            >
              Restablecer
            </button>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 sm:flex-1"
            >
              Guardar preferencias
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default PreferenciasBusqueda
