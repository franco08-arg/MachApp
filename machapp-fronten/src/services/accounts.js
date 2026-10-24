const ACCOUNTS_KEY = 'machapp.accounts'

export const DEMO_ACCOUNTS = [
  {
    email: 'demo@machapp.pe',
    dni: '12345678',
    password: 'machapp123',
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

export const getAccounts = () => [...DEMO_ACCOUNTS, ...readStoredAccounts()]

export const isEmailRegistered = (email) =>
  getAccounts().some((account) => normalizeEmail(account.email) === normalizeEmail(email))

export const isDniRegistered = (dni) =>
  getAccounts().some((account) => String(account.dni) === dni.trim())

export const saveAccount = (account) => {
  const stored = readStoredAccounts()
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...stored, account]))
  return account
}
