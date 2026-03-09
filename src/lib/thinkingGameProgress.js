const THINKING_GAME_PROGRESS_KEY = 'thinkingGameProgress'
const THINKING_GAME_PROGRESS_EVENT = 'thinkingGameProgressUpdated'

const THINKING_GAME_IDS = ['bubble', 'train', 'gratitude', 'voice', 'leaves']
const defaultProgressEntry = { times: 0, best: 0, level: 0 }
const maxLevel = 2

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

const dispatchProgressUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(THINKING_GAME_PROGRESS_EVENT))
  }
}

const clampLevel = (value) => {
  return Math.min(Math.max(value, 0), maxLevel)
}

const normalizeProgressEntry = (value) => {
  if (!value || typeof value !== 'object') {
    return { ...defaultProgressEntry }
  }

  const times = Number.isFinite(value.times) ? Math.max(0, Math.floor(value.times)) : 0
  const best = Number.isFinite(value.best) ? Math.max(0, Math.floor(value.best)) : 0
  const level = Number.isFinite(value.level) ? clampLevel(Math.floor(value.level)) : 0

  return { times, best, level }
}

const createThinkingGameProgressState = () => {
  return THINKING_GAME_IDS.reduce((accumulator, gameId) => {
    accumulator[gameId] = { ...defaultProgressEntry }
    return accumulator
  }, {})
}

const normalizeThinkingGameProgress = (value) => {
  const fallback = createThinkingGameProgressState()

  if (!value || typeof value !== 'object') {
    return fallback
  }

  return THINKING_GAME_IDS.reduce((accumulator, gameId) => {
    accumulator[gameId] = normalizeProgressEntry(value[gameId])
    return accumulator
  }, {})
}

const getCompletedGamesFromProgress = (progressState) => {
  return new Set(
    THINKING_GAME_IDS.filter((gameId) => (progressState[gameId]?.times ?? 0) > 0),
  )
}

const getThinkingGameProgress = () => {
  const storage = getStorage()

  if (!storage) {
    return createThinkingGameProgressState()
  }

  try {
    const storedValue = storage.getItem(THINKING_GAME_PROGRESS_KEY)
    const parsedValue = storedValue ? JSON.parse(storedValue) : null

    return normalizeThinkingGameProgress(parsedValue)
  } catch {
    return createThinkingGameProgressState()
  }
}

const saveThinkingGameProgress = (progressState) => {
  const storage = getStorage()

  if (!storage) {
    return createThinkingGameProgressState()
  }

  const normalizedProgress = normalizeThinkingGameProgress(progressState)
  storage.setItem(THINKING_GAME_PROGRESS_KEY, JSON.stringify(normalizedProgress))
  dispatchProgressUpdated()

  return normalizedProgress
}

const clearThinkingGameProgress = () => {
  const nextProgress = createThinkingGameProgressState()
  saveThinkingGameProgress(nextProgress)
  return nextProgress
}

export {
  THINKING_GAME_IDS,
  THINKING_GAME_PROGRESS_KEY,
  THINKING_GAME_PROGRESS_EVENT as THINKING_GAME_PROGRESS_UPDATED_EVENT,
  defaultProgressEntry as DEFAULT_THINKING_GAME_PROGRESS_ENTRY,
  createThinkingGameProgressState,
  normalizeThinkingGameProgress,
  getCompletedGamesFromProgress,
  getThinkingGameProgress,
  saveThinkingGameProgress,
  clearThinkingGameProgress,
}
