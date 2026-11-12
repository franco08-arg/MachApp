const ACCOUNTS_KEY = 'matchapp.accounts'
const PROFILES_KEY = 'matchapp.profiles'

export const DEMO_ACCOUNTS = [
  {
    email: 'demo@matchapp.pe',
    dni: '12345678',
    password: 'matchapp123',
    nombres: 'Cuenta',
    apellidos: 'Demo',
    role: 'user',
  },
  {
    email: 'admin@matchapp.pe',
    dni: '87654321',
    password: 'admin123',
    nombres: 'Administrador',
    apellidos: 'MatchApp',
    role: 'admin',
  },
]

const readStoredAccounts = () => {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const normalizeEmail = (email) => email.trim().toLowerCase()

const readStoredProfiles = () => {
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const matchesIdentifier = (account, identifier) => {
  const value = String(identifier ?? '').trim().toLowerCase()
  return normalizeEmail(account.email) === value || String(account.dni) === value
}

export const getAccounts = () => {
  const stored = readStoredAccounts()
  const storedEmails = new Set(stored.map((account) => normalizeEmail(account.email)))
  const storedDnis = new Set(stored.map((account) => String(account.dni)))

  const demo = DEMO_ACCOUNTS.filter(
    (account) =>
      !storedEmails.has(normalizeEmail(account.email)) &&
      !storedDnis.has(String(account.dni)),
  )

  return [...stored, ...demo]
}

export const findAccount = (identifier) =>
  getAccounts().find((account) => matchesIdentifier(account, identifier)) ?? null

export const isEmailRegistered = (email) =>
  getAccounts().some((account) => normalizeEmail(account.email) === normalizeEmail(email))

export const isDniRegistered = (dni) =>
  getAccounts().some((account) => String(account.dni) === dni.trim())

export const saveAccount = (account) => {
  const stored = readStoredAccounts()
  const nextAccount = { role: 'user', ...account }
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...stored, nextAccount]))
  return nextAccount
}

export const updateAccount = (identifier, changes) => {
  const account = findAccount(identifier)
  if (!account) return null

  const stored = readStoredAccounts()
  const index = stored.findIndex((item) => matchesIdentifier(item, identifier))

  if (index >= 0) {
    const nextAccount = { ...stored[index], ...changes }
    const nextStored = [...stored]
    nextStored[index] = nextAccount
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextStored))
    return nextAccount
  }

  const nextAccount = { ...account, ...changes }
  window.localStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify([...stored, nextAccount]),
  )
  return nextAccount
}

export const updateAccountPassword = (identifier, password) => {
  const account = findAccount(identifier)
  if (!account) return null

  const stored = readStoredAccounts()
  const index = stored.findIndex((item) => matchesIdentifier(item, identifier))

  if (index >= 0) {
    const nextAccount = { ...stored[index], password }
    const nextStored = [...stored]
    nextStored[index] = nextAccount
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextStored))
    return nextAccount
  }

  const nextAccount = { ...account, password }
  window.localStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify([...stored, nextAccount]),
  )
  return nextAccount
}

const getProfileKey = (identifier) => {
  const account = findAccount(identifier)
  return normalizeEmail(account?.email ?? String(identifier ?? ''))
}

export const getProfile = (identifier) => {
  const key = getProfileKey(identifier)
  if (!key) return null

  const stored = readStoredProfiles()[key]
  if (stored) return stored

  return findAccount(identifier)?.profile ?? null
}

export const saveProfile = (identifier, profile) => {
  const key = getProfileKey(identifier)
  if (!key) return null

  const profiles = readStoredProfiles()
  const nextProfile = {
    ...profiles[key],
    ...profile,
    updatedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(PROFILES_KEY, JSON.stringify({ ...profiles, [key]: nextProfile }))
  return nextProfile
}
