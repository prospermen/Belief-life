const PRACTICE_STORAGE_KEY = 'practiceSessions'
const PRACTICE_STORAGE_EVENT = 'practiceSessionsUpdated'

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

const dispatchPracticeUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PRACTICE_STORAGE_EVENT))
  }
}

const padNumber = (value) => String(value).padStart(2, '0')

const getDateParts = (timestamp = new Date()) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)

  return {
    date: `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`,
    time: `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`,
    createdAt: date.toISOString(),
  }
}

const sortSessions = (sessions) => {
  return [...sessions].sort((firstSession, secondSession) => {
    const firstTime = new Date(firstSession.createdAt).getTime()
    const secondTime = new Date(secondSession.createdAt).getTime()

    return secondTime - firstTime
  })
}

const normalizeSession = (session) => {
  const fallbackDateParts = getDateParts(session?.createdAt)

  return {
    id: session?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    activityType: session?.activityType ?? 'practice',
    activityId: session?.activityId ?? 'unknown',
    title: session?.title ?? '练习记录',
    summary: session?.summary?.trim?.() ?? '',
    insight: session?.insight?.trim?.() ?? '',
    date: session?.date ?? fallbackDateParts.date,
    time: session?.time ?? fallbackDateParts.time,
    createdAt: session?.createdAt ?? fallbackDateParts.createdAt,
    metadata: session?.metadata && typeof session.metadata === 'object' ? session.metadata : {},
  }
}

export const getPracticeSessions = () => {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    const storedValue = storage.getItem(PRACTICE_STORAGE_KEY)

    if (!storedValue) {
      return []
    }

    const parsedSessions = JSON.parse(storedValue)

    if (!Array.isArray(parsedSessions)) {
      return []
    }

    return sortSessions(parsedSessions.map(normalizeSession))
  } catch {
    return []
  }
}

export const savePracticeSession = (session) => {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  const normalizedSession = normalizeSession(session)
  const nextSessions = sortSessions([normalizedSession, ...getPracticeSessions()])

  storage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(nextSessions))
  dispatchPracticeUpdate()

  return normalizedSession
}

export const deletePracticeSession = (sessionId) => {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  const nextSessions = getPracticeSessions().filter((session) => session.id !== sessionId)

  storage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(nextSessions))
  dispatchPracticeUpdate()

  return nextSessions
}

export const PRACTICE_STORAGE_UPDATED_EVENT = PRACTICE_STORAGE_EVENT
