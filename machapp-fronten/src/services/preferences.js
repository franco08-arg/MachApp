const PREFERENCES_KEY = 'matchapp.preferences'

export const AGE_MIN = 18
export const AGE_MAX = 80
export const DISTANCE_MIN = 1
export const DISTANCE_MAX = 100

export const DEFAULT_PREFERENCES = {
  minAge: 18,
  maxAge: 45,
  maxDistance: 25,
}

const getKey = (identifier) => String(identifier ?? '').trim().toLowerCase()

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const readStoredPreferences = () => {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export const normalizePreferences = (preferences = {}) => {
  const minAge = clamp(
    toInt(preferences.minAge, DEFAULT_PREFERENCES.minAge),
    AGE_MIN,
    AGE_MAX,
  )
  const maxAge = clamp(
    toInt(preferences.maxAge, DEFAULT_PREFERENCES.maxAge),
    AGE_MIN,
    AGE_MAX,
  )
  const maxDistance = clamp(
    toInt(preferences.maxDistance, DEFAULT_PREFERENCES.maxDistance),
    DISTANCE_MIN,
    DISTANCE_MAX,
  )

  return {
    minAge: Math.min(minAge, maxAge),
    maxAge: Math.max(minAge, maxAge),
    maxDistance,
  }
}

export const getPreferences = (identifier) => {
  const key = getKey(identifier)
  if (!key) return { ...DEFAULT_PREFERENCES }

  return normalizePreferences(readStoredPreferences()[key])
}

export const savePreferences = (identifier, preferences) => {
  const key = getKey(identifier)
  if (!key) return null

  const nextPreferences = normalizePreferences(preferences)
  const stored = readStoredPreferences()

  window.localStorage.setItem(
    PREFERENCES_KEY,
    JSON.stringify({ ...stored, [key]: nextPreferences }),
  )

  return nextPreferences
}
