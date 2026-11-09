import { NavLink } from 'react-router-dom'

const ITEMS = [
  {
    to: '/descubrimiento',
    label: 'Descubrir',
    icon: (
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm3.5 6.5-2.1 5a1 1 0 0 1-.6.6l-5 2.1a.5.5 0 0 1-.6-.6l2.1-5a1 1 0 0 1 .6-.6l5-2.1a.5.5 0 0 1 .6.6Z" />
    ),
  },
  {
    to: '/matches',
    label: 'Matches',
    icon: (
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    ),
  },
  {
    to: '/chats',
    label: 'Chats',
    icon: (
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2Z" />
    ),
  },
  {
    to: '/gestionar',
    label: 'Perfil',
    icon: (
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z" />
    ),
  },
]

const navLinkClass = ({ isActive }) =>
  `flex flex-1 flex-col items-center gap-1 py-1.5 text-[11px] font-semibold transition ${
    isActive
      ? 'text-rose-500'
      : 'text-slate-400 hover:text-slate-600'
  }`

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white/95 px-3 pb-2 pt-1 backdrop-blur">
      <div className="flex items-center">
        {ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClass}>
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-5 w-5"
            >
              {item.icon}
            </svg>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
