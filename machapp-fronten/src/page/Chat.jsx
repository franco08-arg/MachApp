import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSession } from '../auth.js'
import { getMatchByPerson, markMatchSeen } from '../services/matches.js'
import { getPersonById } from '../services/people.js'
import { addReport, REPORT_REASONS } from '../services/reports.js'

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

function Chat() {
  const { personId } = useParams()
  const person = getPersonById(personId)
  const [session] = useState(() => getSession())
  const [messages, setMessages] = useState(() =>
    person
      ? [
          {
            id: 'welcome',
            author: 'other',
            text: `¡Hola! Qué bueno hacer match contigo. ¿Qué planes tienes para esta semana?`,
          },
        ]
      : [],
  )
  const [draft, setDraft] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [reportError, setReportError] = useState('')
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    if (!person) return

    const match = getMatchByPerson(session?.identifier, person.id)
    if (match && !match.seen) {
      markMatchSeen(session?.identifier, match.id)
    }
  }, [person, session?.identifier])

  useEffect(() => {
    if (!isReportOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsReportOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isReportOpen])

  const openReport = () => {
    setIsMenuOpen(false)
    setReason('')
    setReportError('')
    setReportSent(false)
    setIsReportOpen(true)
  }

  const closeReport = () => {
    setIsReportOpen(false)
  }

  const handleSendReport = () => {
    if (!reason) {
      setReportError('Selecciona un motivo para el reporte.')
      return
    }

    addReport({
      reportedUser: person.name,
      reportedIdentifier: person.id,
      reason,
      reportedBy: session?.identifier,
    })

    setReportError('')
    setReportSent(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const text = draft.trim()
    if (!text) return

    setMessages((current) => [
      ...current,
      {
        id: `message-${Date.now()}`,
        author: 'me',
        text,
      },
    ])
    setDraft('')
  }

  if (!person) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#d9d9d9] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl shadow-black/30">
          <p className="text-sm font-bold text-slate-800">
            No encontramos esta conversación.
          </p>
          <Link
            to="/matches"
            className="mt-5 inline-flex rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/30"
          >
            Volver a matches
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#d9d9d9] px-4 py-6">
      <div className="mx-auto flex h-[calc(100vh-3rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/30">
        <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <Link
            to="/matches"
            aria-label="Volver a matches"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-rose-500"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>

          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${person.color}`}
          >
            <span className="text-sm font-extrabold text-white/90">
              {getInitials(person.name)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">
              {person.name}
            </p>
            <p className="text-[11px] font-medium text-emerald-600">
              En línea
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              aria-label="Opciones de la conversación"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-rose-500"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path d="M12 8a2 2 0 1 0-2-2 2 2 0 0 0 2 2Zm0 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z" />
              </svg>
            </button>

            {isMenuOpen && (
              <>
                <button
                  type="button"
                  aria-hidden="true"
                  tabIndex={-1}
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />
                <div
                  role="menu"
                  className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-black/10"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={openReport}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-4 w-4"
                    >
                      <path d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V8h2v5Z" />
                    </svg>
                    Reportar usuario
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-5">
          <p className="mx-auto w-fit rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold text-rose-500">
            Hicieron match
          </p>

          {messages.map((message) => {
            const isMine = message.author === 'me'

            return (
              <div
                key={message.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-5 ${
                    isMine
                      ? 'rounded-br-md bg-gradient-to-r from-[#f2455c] to-[#f58a5f] text-white'
                      : 'rounded-bl-md bg-white text-slate-700 shadow-sm'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-slate-200 px-3 py-3"
        >
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escribe un mensaje…"
            aria-label="Escribe un mensaje"
            className="w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          />
          <button
            type="submit"
            aria-label="Enviar mensaje"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f2455c] to-[#f58a5f] text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path d="M3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91Z" />
            </svg>
          </button>
        </form>
      </div>

      {isReportOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl shadow-black/40"
          >
            {reportSent ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-7 w-7"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>

                <h2
                  id="report-title"
                  className="mt-4 text-xl font-extrabold text-slate-900"
                >
                  Reporte enviado
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Gracias. Revisaremos la conducta de {person.name} y tomaremos
                  las medidas necesarias.
                </p>

                <button
                  type="button"
                  onClick={closeReport}
                  className="mt-5 w-full rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-rose-200"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <>
                <h2
                  id="report-title"
                  className="text-xl font-extrabold text-slate-900"
                >
                  Reportar a {person.name}
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Selecciona el motivo del reporte. Tu identidad no se mostrará
                  a la persona reportada.
                </p>

                <div className="mt-4 space-y-2">
                  {REPORT_REASONS.map((option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        reason === option
                          ? 'border-rose-400 bg-rose-50 text-rose-600'
                          : 'border-slate-200 text-slate-600 hover:border-rose-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={option}
                        checked={reason === option}
                        onChange={() => {
                          setReason(option)
                          setReportError('')
                        }}
                        className="h-4 w-4 text-rose-500 focus:ring-rose-400"
                      />
                      {option}
                    </label>
                  ))}
                </div>

                {reportError && (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {reportError}
                  </p>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeReport}
                    className="w-full rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500 sm:flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSendReport}
                    className="w-full rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-rose-200 sm:flex-1"
                  >
                    Enviar reporte
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default Chat
