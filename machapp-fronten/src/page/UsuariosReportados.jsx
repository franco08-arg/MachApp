import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getReports, getReportedUsers } from '../services/reports.js'

const formatDate = (value) => {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const STATUS_LABEL = {
  pendiente: 'Pendiente',
  revisado: 'Revisado',
  descartado: 'Descartado',
}

const STATUS_CLASS = {
  pendiente: 'bg-amber-100 text-amber-700',
  revisado: 'bg-emerald-100 text-emerald-700',
  descartado: 'bg-slate-100 text-slate-500',
}

function UsuariosReportados() {
  const [reports] = useState(() => getReports())
  const [reportedUsers] = useState(() => getReportedUsers())

  const pending = reports.filter((report) => report.status === 'pendiente').length

  return (
    <main className="min-h-screen bg-[#d9d9d9] px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white px-6 py-8 shadow-2xl shadow-black/30 sm:px-8">
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
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
              Admin
            </span>
          </div>
          <Link
            to="/descubrimiento"
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500"
          >
            Volver al feed
          </Link>
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
          Usuarios reportados
        </h1>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Revisa los reportes enviados por los usuarios de MatchApp.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">Reportes</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">
              {reports.length}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">Usuarios</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">
              {reportedUsers.length}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">Pendientes</p>
            <p className="mt-1 text-xl font-extrabold text-rose-500">
              {pending}
            </p>
          </div>
        </div>

        {reportedUsers.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {reportedUsers.map((user) => (
              <li
                key={user.reportedIdentifier ?? user.reportedUser}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {user.reportedUser || 'Usuario sin nombre'}
                    </p>
                    {user.reportedIdentifier && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {user.reportedIdentifier}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS_CLASS[user.status] ?? STATUS_CLASS.pendiente
                    }`}
                  >
                    {STATUS_LABEL[user.status] ?? 'Pendiente'}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {user.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-500"
                    >
                      {reason}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    {user.total} reporte{user.total === 1 ? '' : 's'}
                  </span>
                  <span>Último: {formatDate(user.lastReportAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Todavía no hay usuarios reportados.
          </p>
        )}
      </div>
    </main>
  )
}

export default UsuariosReportados
