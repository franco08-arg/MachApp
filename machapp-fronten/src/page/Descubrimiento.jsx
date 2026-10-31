import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../auth.js'
import { generateText, isGeminiConfigured } from '../services/gemini.js'
import { getPreferences } from '../services/preferences.js'

const SUGGESTION_PROMPT =
  'Eres el asistente de MatchApp, una app para descubrir personas y planes. ' +
  'Sugiere en español, en un máximo de 60 palabras y sin listas, una idea ' +
  'concreta para conocer gente con intereses afines esta semana.'

const DEMO_PEOPLE = [
  { id: 'valeria', name: 'Valeria', age: 26, distanceKm: 3, interests: ['Música', 'Viajes'] },
  { id: 'diego', name: 'Diego', age: 31, distanceKm: 8, interests: ['Cine', 'Deporte'] },
  { id: 'lucia', name: 'Lucía', age: 24, distanceKm: 15, interests: ['Cocina', 'Música'] },
  { id: 'mateo', name: 'Mateo', age: 38, distanceKm: 22, interests: ['Viajes', 'Deporte'] },
  { id: 'sofia', name: 'Sofía', age: 44, distanceKm: 35, interests: ['Cine', 'Cocina'] },
  { id: 'andres', name: 'Andrés', age: 52, distanceKm: 60, interests: ['Música', 'Viajes'] },
]

const matchesPreferences = (person, preferences) =>
  person.age >= preferences.minAge &&
  person.age <= preferences.maxAge &&
  person.distanceKm <= preferences.maxDistance

function Descubrimiento() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()
  const preferences = getPreferences(session?.identifier)
  const visiblePeople = DEMO_PEOPLE.filter((person) =>
    matchesPreferences(person, preferences),
  )
  const [suggestion, setSuggestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const handleLogout = () => {
    clearSession()
    navigate('/', { replace: true })
  }

  const handleGenerateSuggestion = async () => {
    setIsLoading(true)
    setAiError('')

    try {
      setSuggestion(await generateText(SUGGESTION_PROMPT))
    } catch (error) {
      setAiError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              MatchApp
            </p>
            <h1 className="mt-2 text-3xl font-bold">Descubrimiento</h1>
            {session?.identifier && (
              <p className="mt-1 text-sm text-slate-400">
                Sesión iniciada como {session.identifier}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/preferencias"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Preferencias
            </Link>
            <Link
              to="/gestionar"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Perfil y ajustes
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="mt-10 rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Personas cerca de ti</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                Perfiles filtrados según tus preferencias de edad y distancia.
              </p>
            </div>
            <Link
              to="/preferencias"
              className="self-start rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Editar preferencias
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-indigo-300">
              {preferences.minAge} – {preferences.maxAge} años
            </span>
            <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-indigo-300">
              Hasta {preferences.maxDistance} km
            </span>
          </div>

          {location.state?.preferencesSaved && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              Preferencias guardadas. El feed ya las aplica.
            </p>
          )}

          {visiblePeople.length > 0 ? (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {visiblePeople.map((person) => (
                <li
                  key={person.id}
                  className="rounded-2xl bg-slate-900/60 p-5 ring-1 ring-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{person.name}</p>
                    <span className="text-xs text-slate-400">
                      {person.distanceKm} km
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {person.age} años
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {person.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              No hay perfiles que coincidan con tus preferencias. Amplía el rango
              de edad o la distancia máxima.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <h2 className="text-xl font-semibold">Sugerencia con IA</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
            Genera una idea de plan con Google Gemini según tu sesión actual.
          </p>
          <button
            type="button"
            onClick={handleGenerateSuggestion}
            disabled={isLoading || !isGeminiConfigured()}
            className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isLoading ? 'Generando…' : 'Generar sugerencia'}
          </button>
          {!isGeminiConfigured() && (
            <p className="mt-3 text-xs text-amber-400">
              Configura VITE_GEMINI_API_KEY en .env.local para habilitarlo.
            </p>
          )}
          {aiError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              {aiError}
            </p>
          )}
          {suggestion && (
            <p className="mt-4 whitespace-pre-line rounded-xl bg-slate-900/60 px-4 py-3 text-sm leading-6 text-slate-200">
              {suggestion}
            </p>
          )}
        </section>
      </div>
    </main>
  )
}

export default Descubrimiento
