const MATCHES_KEY = 'matchapp.matches'

const getKey = (identifier) => String(identifier ?? '').trim().toLowerCase()

const readAll = () => {
  try {
    const raw = window.localStorage.getItem(MATCHES_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const writeAll = (value) => {
  window.localStorage.setItem(MATCHES_KEY, JSON.stringify(value))
}

export const getMatches = (identifier) => {
  const key = getKey(identifier)
  if (!key) return []

  const matches = readAll()[key]
  if (!Array.isArray(matches)) return []

  return [...matches].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )
}

export const getNewMatches = (identifier) =>
  getMatches(identifier).filter((match) => !match.seen)

export const getMatchByPerson = (identifier, personId) =>
  getMatches(identifier).find((match) => match.personId === personId) ?? null

export const markMatchSeen = (identifier, matchId) => {
  const key = getKey(identifier)
  if (!key || !matchId) return null

  const all = readAll()
  const matches = all[key]
  if (!Array.isArray(matches)) return null

  const nextMatches = matches.map((match) =>
    match.id === matchId ? { ...match, seen: true } : match,
  )

  writeAll({ ...all, [key]: nextMatches })
  return nextMatches.find((match) => match.id === matchId) ?? null
}

export const registerMutualLike = ({ identifier, userName, person }) => {
  if (!person?.likesYou) return null

  const key = getKey(identifier)
  const otherKey = getKey(person.id)
  if (!key || !otherKey) return null

  const all = readAll()
  const userMatches = Array.isArray(all[key]) ? all[key] : []

  if (userMatches.some((match) => match.personId === person.id)) {
    return null
  }

  const createdAt = new Date().toISOString()
  const matchId = `match-${person.id}-${Date.now()}`

  const userMatch = {
    id: matchId,
    personId: person.id,
    personName: person.name,
    personAge: person.age,
    personColor: person.color,
    createdAt,
    seen: false,
  }

  const otherMatch = {
    id: `${matchId}-other`,
    personId: identifier,
    personName: userName || identifier,
    createdAt,
    seen: false,
  }

  const otherMatches = Array.isArray(all[otherKey]) ? all[otherKey] : []

  writeAll({
    ...all,
    [key]: [userMatch, ...userMatches],
    [otherKey]: [otherMatch, ...otherMatches],
  })

  return userMatch
}
