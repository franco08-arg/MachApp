const ACCOUNTS_KEY = 'matchapp.accounts'
const PROFILES_KEY = 'matchapp.profiles'

export const DEMO_ACCOUNTS = [
  {
    email: 'demo@matchapp.pe',
    dni: '12345678',
    password: 'matchapp123',
    nombres: 'Cuenta',
    apellidos: 'Demo',
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

export const getAccounts = () => [...DEMO_ACCOUNTS, ...readStoredAccounts()]

export const findAccount = (identifier) =>
  getAccounts().find((account) => matchesIdentifier(account, identifier)) ?? null

export const isEmailRegistered = (email) =>
  getAccounts().some((account) => normalizeEmail(account.email) === normalizeEmail(email))

export const isDniRegistered = (dni) =>
  getAccounts().some((account) => String(account.dni) === dni.trim())

export const saveAccount = (account) => {
  const stored = readStoredAccounts()
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...stored, account]))
  return account
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
