import { useState } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav.jsx'
import { getSession } from '../auth.js'
import { getMatches } from '../services/matches.js'

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

function Chats() {
  const [session] = useState(() => getSession())
  const [matches] = useState(() => getMatches(session?.identifier))

  return (
    <main className="min-h-screen bg-[#d9d9d9] pb-24">
      <div className="mx-auto w-full max-w-md px-4 pt-6">
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

        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Chats</h1>
        <p className="mt-1 text-xs text-slate-500">
          Tus conversaciones con personas que hicieron match contigo.
        </p>

        {matches.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {matches.map((match) => (
              <li key={match.id}>
                <Link
                  to={`/chat/${match.personId}`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-lg shadow-slate-400/20 transition hover:bg-rose-50/40"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                      match.personColor ?? 'from-rose-400 to-pink-500'
                    }`}
                  >
                    <span className="text-base font-extrabold text-white/90">
                      {getInitials(match.personName)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {match.personName}
                      </p>
                      {!match.seen && (
                        <span className="shrink-0 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {match.seen
                        ? 'Abrir conversación'
                        : 'Hicieron match, ¡saluda!'}
                    </p>
                  </div>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-slate-400"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center">
            <p className="text-sm font-bold text-slate-800">
              Aún no tienes conversaciones
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Cuando hagas match con alguien podrás chatear desde aquí.
            </p>
            <Link
              to="/descubrimiento"
              className="mt-5 rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105"
            >
              Descubrir personas
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}

export default Chats
