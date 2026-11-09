import { useState } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav.jsx'
import { getSession } from '../auth.js'
import { getLikedPeople } from '../services/interactions.js'
import { getMatches, getNewMatches } from '../services/matches.js'

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

function Matches() {
  const [session] = useState(() => getSession())
  const [matches] = useState(() => getMatches(session?.identifier))
  const [newMatches] = useState(() => getNewMatches(session?.identifier))
  const [likedPeople] = useState(() => getLikedPeople(session?.identifier))

  const previousMatches = matches.filter((match) => match.seen)
  const matchedIds = new Set(matches.map((match) => match.personId))
  const pendingLikes = likedPeople.filter(
    (person) => !matchedIds.has(person.id),
  )

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

        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Matches</h1>
        <p className="mt-1 text-xs text-slate-500">
          Coincidencias y personas a las que les diste like.
        </p>

        {newMatches.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Matches nuevos
              </h2>
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {newMatches.length}
              </span>
            </div>

            <ul className="mt-3 space-y-3">
              {newMatches.map((match) => (
                <li
                  key={match.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-lg shadow-slate-400/20 ring-2 ring-rose-200"
                >
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                      match.personColor ?? 'from-rose-400 to-pink-500'
                    }`}
                  >
                    <span className="text-lg font-extrabold text-white/90">
                      {getInitials(match.personName)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {match.personName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      Se gustaron mutuamente
                    </p>
                  </div>

                  <Link
                    to={`/chat/${match.personId}`}
                    className="shrink-0 rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105"
                  >
                    Chat
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {previousMatches.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-bold text-slate-900">
              Matches anteriores
            </h2>

            <ul className="mt-3 space-y-2">
              {previousMatches.map((match) => (
                <li
                  key={match.id}
                  className="flex items-center gap-3 rounded-xl bg-white/80 p-3"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                      match.personColor ?? 'from-rose-400 to-pink-500'
                    }`}
                  >
                    <span className="text-sm font-extrabold text-white/90">
                      {getInitials(match.personName)}
                    </span>
                  </div>

                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                    {match.personName}
                  </p>

                  <Link
                    to={`/chat/${match.personId}`}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                  >
                    Abrir chat
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {pendingLikes.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-bold text-slate-900">Tus likes</h2>

            <ul className="mt-3 grid grid-cols-2 gap-3">
              {pendingLikes.map((person) => (
                <li
                  key={person.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-400/20"
                >
                  <div
                    className={`flex h-24 items-center justify-center bg-gradient-to-br ${person.color}`}
                  >
                    <span className="text-3xl font-extrabold text-white/85">
                      {getInitials(person.name)}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-slate-900">
                      {person.name}, {person.age}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      a {person.distanceKm} km
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {person.interests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-500"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {matches.length === 0 && likedPeople.length === 0 && (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center">
            <p className="text-sm font-bold text-slate-800">
              Todavía no tienes matches
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Explora perfiles y dale like a quienes te interesen.
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

export default Matches
