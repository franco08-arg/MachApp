import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav.jsx'
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
  '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-rose-500 [&::-moz-range-thumb]:shadow-md'

const THUMB_SIZE = 20

const valueFromPointer = (clientX, element, min, max) => {
  if (!element) return min

  const rect = element.getBoundingClientRect()
  const usable = Math.max(rect.width - THUMB_SIZE, 1)
  const ratio = (clientX - rect.left - THUMB_SIZE / 2) / usable
  const clamped = Math.min(Math.max(ratio, 0), 1)

  return Math.round(min + clamped * (max - min))
}

const percent = (value, min, max) => ((value - min) / (max - min)) * 100

const THUMB_BUBBLE_CLASS =
  'pointer-events-none absolute -top-9 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md after:absolute after:left-1/2 after:top-full after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:rounded-[1px] after:bg-rose-500'

const bubbleStyle = (value) => {
  const clamped = Math.min(Math.max(value, 0), 100)
  return { left: `calc(${clamped}% + ${10 - clamped * 0.2}px)` }
}

function PreferenciasBusqueda() {
  const navigate = useNavigate()
  const [session] = useState(() => getSession())
  const [preferences, setPreferences] = useState(() =>
    getPreferences(session?.identifier),
  )

  const ageTrackRef = useRef(null)
  const distanceTrackRef = useRef(null)
  const activeAgeHandle = useRef(null)
  const isDraggingDistance = useRef(false)

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

  const setAgeValue = (handle, value) => {
    setPreferences((current) =>
      handle === 'minAge'
        ? { ...current, minAge: Math.min(value, current.maxAge) }
        : { ...current, maxAge: Math.max(value, current.minAge) },
    )
  }

  const handleAgePointerDown = (event) => {
    const value = valueFromPointer(
      event.clientX,
      ageTrackRef.current,
      AGE_MIN,
      AGE_MAX,
    )
    const handle =
      Math.abs(value - preferences.minAge) <=
      Math.abs(value - preferences.maxAge)
        ? 'minAge'
        : 'maxAge'

    activeAgeHandle.current = handle
    event.currentTarget.setPointerCapture(event.pointerId)
    setAgeValue(handle, value)
  }

  const handleAgePointerMove = (event) => {
    if (!activeAgeHandle.current) return

    const value = valueFromPointer(
      event.clientX,
      ageTrackRef.current,
      AGE_MIN,
      AGE_MAX,
    )
    setAgeValue(activeAgeHandle.current, value)
  }

  const handleAgePointerEnd = (event) => {
    activeAgeHandle.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleDistancePointerDown = (event) => {
    isDraggingDistance.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    setPreferences((current) => ({
      ...current,
      maxDistance: valueFromPointer(
        event.clientX,
        distanceTrackRef.current,
        DISTANCE_MIN,
        DISTANCE_MAX,
      ),
    }))
  }

  const handleDistancePointerMove = (event) => {
    if (!isDraggingDistance.current) return

    setPreferences((current) => ({
      ...current,
      maxDistance: valueFromPointer(
        event.clientX,
        distanceTrackRef.current,
        DISTANCE_MIN,
        DISTANCE_MAX,
      ),
    }))
  }

  const handleDistancePointerEnd = (event) => {
    isDraggingDistance.current = false

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
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
            to="/ajustes"
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500"
          >
            Volver
          </Link>
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
          Preferencias de búsqueda
        </h1>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Ajusta la edad y la distancia para decidir qué perfiles aparecen en
          tu feed de descubrimiento.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-400/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Rango de edad
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Edad mínima: {preferences.minAge} años · Edad máxima:{' '}
                  {preferences.maxAge} años
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-600">
                {preferences.minAge} – {preferences.maxAge} años
              </span>
            </div>

            <div
              ref={ageTrackRef}
              onPointerDown={handleAgePointerDown}
              onPointerMove={handleAgePointerMove}
              onPointerUp={handleAgePointerEnd}
              onPointerCancel={handleAgePointerEnd}
              className="relative mt-10 h-6 cursor-pointer touch-none select-none"
            >
              <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
              <div
                className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f]"
                style={{ left: `${ageLeft}%`, right: `${100 - ageRight}%` }}
              />
              <span
                aria-hidden="true"
                className={THUMB_BUBBLE_CLASS}
                style={bubbleStyle(ageLeft)}
              >
                {preferences.minAge} años
              </span>
              <span
                aria-hidden="true"
                className={THUMB_BUBBLE_CLASS}
                style={bubbleStyle(ageRight)}
              >
                {preferences.maxAge} años
              </span>
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

          <section className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-400/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Distancia máxima
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Solo verás personas dentro de este radio.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-600">
                {preferences.maxDistance} km
              </span>
            </div>

            <div
              ref={distanceTrackRef}
              onPointerDown={handleDistancePointerDown}
              onPointerMove={handleDistancePointerMove}
              onPointerUp={handleDistancePointerEnd}
              onPointerCancel={handleDistancePointerEnd}
              className="relative mt-10 h-6 cursor-pointer touch-none select-none"
            >
              <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
              <div
                className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f]"
                style={{ left: 0, width: `${distancePercent}%` }}
              />
              <span
                aria-hidden="true"
                className={THUMB_BUBBLE_CLASS}
                style={bubbleStyle(distancePercent)}
              >
                {preferences.maxDistance} km
              </span>
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
              className="w-full rounded-full border border-slate-300 px-4 py-3.5 text-center text-sm font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500 sm:flex-1"
            >
              Restablecer
            </button>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-rose-200 sm:flex-1"
            >
              Guardar preferencias
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </main>
  )
}

export default PreferenciasBusqueda
