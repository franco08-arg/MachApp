import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../auth.js'
import { generateText, isGeminiConfigured } from '../services/gemini.js'

const SUGGESTION_PROMPT =
  'Eres el asistente de MachApp, una app para descubrir personas y planes. ' +
  'Sugiere en español, en un máximo de 60 palabras y sin listas, una idea ' +
  'concreta para conocer gente con intereses afines esta semana.'

function Descubrimiento() {
  const navigate = useNavigate()
  const session = getSession()
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
              MachApp
            </p>
            <h1 className="mt-2 text-3xl font-bold">Descubrimiento</h1>
            {session?.identifier && (
              <p className="mt-1 text-sm text-slate-400">
                Sesión iniciada como {session.identifier}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="self-start rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            Cerrar sesión
          </button>
        </header>

        <section className="mt-10 rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <h2 className="text-xl font-semibold">Personas cerca de ti</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
            Esta es una ruta protegida. Solo se muestra si hay una sesión activa;
            de lo contrario el router redirige al inicio de sesión.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              to="/"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
            >
              Ir al inicio de sesión
            </Link>
            <Link
              to="/registro"
              className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Crear cuenta
            </Link>
          </div>
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
