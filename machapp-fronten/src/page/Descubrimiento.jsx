import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav.jsx'
import { getSession } from '../auth.js'
import { findAccount, getProfile } from '../services/accounts.js'
import { getInteractions, saveInteraction } from '../services/interactions.js'
import { markMatchSeen, registerMutualLike } from '../services/matches.js'
import { DEMO_PEOPLE } from '../services/people.js'
import { getPreferences } from '../services/preferences.js'
import { generateText, isGeminiConfigured } from '../services/gemini.js'

const SWIPE_THRESHOLD = 110

const SUGGESTION_PROMPT =
  'Eres el asistente de MatchApp, una app para descubrir personas y planes. ' +
  'Sugiere en español, en un máximo de 60 palabras y sin listas, una idea ' +
  'concreta para conocer gente con intereses afines esta semana.'

const matchesFilters = (person, preferences, lookingFor) => {
  const ageOk =
    person.age >= preferences.minAge && person.age <= preferences.maxAge
  const distanceOk = person.distanceKm <= preferences.maxDistance
  const genderOk =
    !lookingFor ||
    lookingFor === 'Todos' ||
    (lookingFor === 'Mujeres' && person.gender === 'Mujer') ||
    (lookingFor === 'Hombres' && person.gender === 'Hombre')

  return ageOk && distanceOk && genderOk
}

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

function Descubrimiento() {
  const navigate = useNavigate()
  const session = getSession()
  const account = session?.identifier ? findAccount(session.identifier) : null
  const isAdmin = (session?.role ?? account?.role) === 'admin'
  const profile = getProfile(session?.identifier)
  const preferences = getPreferences(session?.identifier)

  const [interactions, setInteractions] = useState(() =>
    getInteractions(session?.identifier),
  )
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const [exit, setExit] = useState(null)
  const [matchPopup, setMatchPopup] = useState(null)
  const [suggestion, setSuggestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const startRef = useRef(null)
  const currentXRef = useRef(0)

  const available = DEMO_PEOPLE.filter(
    (person) =>
      matchesFilters(person, preferences, profile?.lookingFor) &&
      !interactions[person.id],
  )

  const current = available[0]
  const nextPerson = available[1]

  const decide = (type) => {
    if (!current || exit) return

    const person = current
    setExit(type)
    setDrag({ x: 0, y: 0, active: false })

    window.setTimeout(() => {
      saveInteraction(session?.identifier, person.id, type)
      setInteractions((prev) => ({
        ...prev,
        [person.id]: { type, at: new Date().toISOString() },
      }))

      if (type === 'like') {
        const userName =
          [account?.nombres, account?.apellidos].filter(Boolean).join(' ') ||
          session?.identifier
        const match = registerMutualLike({
          identifier: session?.identifier,
          userName,
          person,
        })

        if (match) {
          setMatchPopup({ match, person })
        }
      }

      setExit(null)
      currentXRef.current = 0
    }, 240)
  }

  const handleGoToChat = () => {
    if (!matchPopup) return

    markMatchSeen(session?.identifier, matchPopup.match.id)
    const personId = matchPopup.person.id
    setMatchPopup(null)
    navigate(`/chat/${personId}`)
  }

  const handleKeepSwiping = () => {
    setMatchPopup(null)
  }

  const handlePointerDown = (event) => {
    if (!current || exit) return

    startRef.current = { x: event.clientX, y: event.clientY }
    currentXRef.current = 0
    setDrag({ x: 0, y: 0, active: true })
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!startRef.current) return

    const x = event.clientX - startRef.current.x
    const y = event.clientY - startRef.current.y
    currentXRef.current = x
    setDrag({ x, y, active: true })
  }

  const handlePointerUp = () => {
    if (!startRef.current) return

    const x = currentXRef.current
    startRef.current = null
    setDrag({ x: 0, y: 0, active: false })

    if (x > SWIPE_THRESHOLD) {
      decide('like')
    } else if (x < -SWIPE_THRESHOLD) {
      decide('reject')
    }
  }

  const handlePointerCancel = () => {
    startRef.current = null
    currentXRef.current = 0
    setDrag({ x: 0, y: 0, active: false })
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

  const cardStyle = exit
    ? {
        transform: `translateX(${exit === 'like' ? 520 : -520}px) rotate(${
          exit === 'like' ? 20 : -20
        }deg)`,
        opacity: 0,
        transition: 'transform 240ms ease, opacity 240ms ease',
      }
    : {
        transform: `translateX(${drag.x}px) translateY(${
          drag.y * 0.12
        }px) rotate(${drag.x / 22}deg)`,
        transition: drag.active ? 'none' : 'transform 200ms ease',
      }

  const likeOpacity =
    exit === 'like'
      ? 1
      : drag.x > 0
        ? Math.min(drag.x / SWIPE_THRESHOLD, 1)
        : 0
  const rejectOpacity =
    exit === 'reject'
      ? 1
      : drag.x < 0
        ? Math.min(-drag.x / SWIPE_THRESHOLD, 1)
        : 0

  return (
    <main className="min-h-screen bg-[#d9d9d9] pb-24">
      <div className="mx-auto w-full max-w-md px-4 pt-6">
        <header className="flex items-center justify-between gap-4">
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
          {isAdmin && (
            <Link
              to="/admin/reportes"
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500"
            >
              Reportes
            </Link>
          )}
        </header>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Descubrir
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Desliza o usa los botones para elegir.
            </p>
          </div>
          <Link
            to="/preferencias"
            className="text-xs font-semibold text-rose-500 hover:text-rose-600"
          >
            {preferences.minAge}–{preferences.maxAge} años ·{' '}
            {preferences.maxDistance} km
          </Link>
        </div>

        <div className="relative mt-5 h-[440px]">
          {nextPerson && (
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-3 h-[420px] rounded-[28px] bg-white/70 shadow-lg shadow-slate-400/20"
            />
          )}

          {current ? (
            <article
              className="absolute inset-0 flex touch-none select-none flex-col overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-400/40"
              style={cardStyle}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              <div
                className={`relative h-56 shrink-0 bg-gradient-to-br ${current.color}`}
              >
                <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20" />
                <div className="absolute -bottom-12 -right-8 h-44 w-44 rounded-full bg-white/15" />
                <span className="absolute inset-0 flex items-center justify-center text-6xl font-extrabold tracking-tight text-white/85">
                  {getInitials(current.name)}
                </span>

                <span
                  style={{ opacity: likeOpacity }}
                  className="absolute left-4 top-4 -rotate-12 rounded-xl border-4 border-emerald-400 px-3 py-1 text-xl font-extrabold uppercase tracking-wide text-emerald-400"
                >
                  Like
                </span>
                <span
                  style={{ opacity: rejectOpacity }}
                  className="absolute right-4 top-4 rotate-12 rounded-xl border-4 border-rose-400 px-3 py-1 text-xl font-extrabold uppercase tracking-wide text-rose-400"
                >
                  Nope
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {current.name}, {current.age}
                </h2>

                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-4 w-4 text-rose-400"
                  >
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z" />
                  </svg>
                  a {current.distanceKm} km
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {current.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-500"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ) : (
            <div className="flex h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 text-center">
              <p className="text-lg font-bold text-slate-800">
                No hay más perfiles por ahora
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Ya interactuaste con todos los perfiles que cumplen tus
                preferencias. Ajusta la edad, distancia o género.
              </p>
              <Link
                to="/preferencias"
                className="mt-5 rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105"
              >
                Ajustar preferencias
              </Link>
            </div>
          )}
        </div>

        {current && (
          <div className="mt-6 flex items-center justify-center gap-8">
            <button
              type="button"
              onClick={() => decide('reject')}
              aria-label="Rechazar perfil"
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-300 bg-white text-rose-500 shadow-lg shadow-slate-300/50 transition hover:scale-105 hover:bg-rose-50 active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
                className="h-7 w-7"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => decide('like')}
              aria-label="Dar like al perfil"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f2455c] to-[#f58a5f] text-white shadow-lg shadow-rose-500/40 transition hover:scale-105 hover:brightness-105 active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="h-7 w-7"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>
        )}

        <section className="mt-8 rounded-2xl bg-white p-5 shadow-lg shadow-slate-400/20">
          <h2 className="text-sm font-bold text-slate-900">
            Sugerencia con IA
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Genera una idea de plan con Google Gemini según tu sesión actual.
          </p>
          <button
            type="button"
            onClick={handleGenerateSuggestion}
            disabled={isLoading || !isGeminiConfigured()}
            className="mt-4 rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
          >
            {isLoading ? 'Generando…' : 'Generar sugerencia'}
          </button>
          {!isGeminiConfigured() && (
            <p className="mt-2 text-xs text-amber-600">
              Configura VITE_GEMINI_API_KEY en .env.local para habilitarlo.
            </p>
          )}
          {aiError && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"
            >
              {aiError}
            </p>
          )}
          {suggestion && (
            <p className="mt-3 whitespace-pre-line rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
              {suggestion}
            </p>
          )}
        </section>
      </div>

      {matchPopup && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-popup-title"
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl shadow-black/40"
          >
            <div
              className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${matchPopup.person.color} shadow-lg`}
            >
              <span className="text-3xl font-extrabold text-white/90">
                {getInitials(matchPopup.person.name)}
              </span>
            </div>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-rose-500">
              MatchApp
            </p>
            <h2
              id="match-popup-title"
              className="mt-1 text-3xl font-extrabold text-slate-900"
            >
              ¡Es un match!
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tú y {matchPopup.person.name} se gustaron mutuamente.
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleGoToChat}
                className="w-full rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-rose-200"
              >
                Ir al chat
              </button>
              <button
                type="button"
                onClick={handleKeepSwiping}
                className="w-full rounded-full border border-slate-300 px-4 py-3.5 text-sm font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500"
              >
                Seguir deslizando
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  )
}

export default Descubrimiento
