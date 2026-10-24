const SESSION_KEY = 'machapp.session'

export const getSession = () => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const saveSession = (session) => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export const clearSession = () => {
  window.localStorage.removeItem(SESSION_KEY)
}

export const isAuthenticated = () => Boolean(getSession())
