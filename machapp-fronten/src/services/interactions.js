import { DEMO_PEOPLE } from './people.js'

const INTERACTIONS_KEY = 'matchapp.interactions'
const VALID_TYPES = ['like', 'reject']

const getKey = (identifier) =>
  String(identifier ?? '').trim().toLowerCase()

const readAll = () => {
  try {
    const raw = window.localStorage.getItem(INTERACTIONS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export const getInteractions = (identifier) => {
  const key = getKey(identifier)
  if (!key) return {}

  return readAll()[key] ?? {}
}

export const saveInteraction = (identifier, personId, type) => {
  const key = getKey(identifier)
  if (!key || !personId || !VALID_TYPES.includes(type)) return null

  const all = readAll()
  const userInteractions = all[key] ?? {}

  const nextInteraction = {
    type,
    at: new Date().toISOString(),
  }

  window.localStorage.setItem(
    INTERACTIONS_KEY,
    JSON.stringify({
      ...all,
      [key]: { ...userInteractions, [personId]: nextInteraction },
    }),
  )

  return nextInteraction
}

export const getLikedPeople = (identifier) => {
  const interactions = getInteractions(identifier)

  return DEMO_PEOPLE.filter(
    (person) => interactions[person.id]?.type === 'like',
  )
}

export const getRejectedPeople = (identifier) => {
  const interactions = getInteractions(identifier)

  return DEMO_PEOPLE.filter(
    (person) => interactions[person.id]?.type === 'reject',
  )
}
