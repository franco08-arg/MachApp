import { Link } from 'react-router-dom'

function MatchHeart() {
  return (
    <div className="relative h-24 w-32">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 -rotate-12 drop-shadow-[0_10px_18px_rgba(236,72,153,0.35)]"
      >
        <defs>
          <linearGradient id="match-heart-main" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f2455c" />
            <stop offset="55%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="url(#match-heart-main)"
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="absolute right-4 top-3 h-10 w-10 rotate-12 drop-shadow-[0_6px_12px_rgba(236,72,153,0.3)]"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="url(#match-heart-main)"
        />
      </svg>
    </div>
  )
}

function Interfaz() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#d9d9d9] px-4 py-8">
      <div className="flex min-h-[660px] w-full max-w-[430px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-500/30">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-1.5 text-rose-500">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-lg font-extrabold tracking-tight">
              MatchApp
            </span>
          </div>
          <Link
            to="/login"
            className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-500"
          >
            Iniciar sesión
          </Link>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-8 pb-10 pt-6 text-center">
          <MatchHeart />

          <h1 className="mt-6 text-2xl font-extrabold leading-snug text-slate-900">
            Conecta solo con quien
            <br />
            también quiere
            <br />
            conectar
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Desliza, haz match y chatea en tiempo
            <br />
            real. Sin mensajes no deseados.
          </p>

          <div className="mt-8 w-full space-y-3">
            <Link
              to="/registro"
              className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#f2455c] to-[#f58a5f] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              Crear cuenta
            </Link>
            <Link
              to="/login"
              className="flex w-full items-center justify-center rounded-full border border-rose-400 px-4 py-3.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-100"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Interfaz
