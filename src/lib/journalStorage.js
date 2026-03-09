const JOURNAL_STORAGE_KEY = 'journalEntries'
const JOURNAL_STORAGE_EVENT = 'journalEntriesUpdated'

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

const dispatchJournalUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(JOURNAL_STORAGE_EVENT))
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

const normalizeEntry = (entry) => {
  const fallbackDateParts = getDateParts(entry?.createdAt)

  return {
    id: entry?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: entry?.date ?? fallbackDateParts.date,
    time: entry?.time ?? fallbackDateParts.time,
    createdAt: entry?.createdAt ?? fallbackDateParts.createdAt,
    mood: entry?.mood ?? 'calm',
    intensity: Number(entry?.intensity ?? 5),
    content: entry?.content?.trim?.() ?? '',
    tags: Array.isArray(entry?.tags) ? entry.tags : [],
  }
}

const sortEntries = (entries) => {
  return [...entries].sort((firstEntry, secondEntry) => {
    const firstTimestamp = new Date(firstEntry.createdAt ?? `${firstEntry.date}T${firstEntry.time ?? '00:00'}`).getTime()
    const secondTimestamp = new Date(secondEntry.createdAt ?? `${secondEntry.date}T${secondEntry.time ?? '00:00'}`).getTime()

    return secondTimestamp - firstTimestamp
  })
}

export const getJournalEntries = () => {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    const storedValue = storage.getItem(JOURNAL_STORAGE_KEY)

    if (!storedValue) {
      return []
    }

    const parsedEntries = JSON.parse(storedValue)

    if (!Array.isArray(parsedEntries)) {
      return []
    }

    return sortEntries(parsedEntries.map(normalizeEntry))
  } catch {
    return []
  }
}

export const saveJournalEntry = (entry) => {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  const normalizedEntry = normalizeEntry(entry)
  const entries = getJournalEntries()
  const nextEntries = sortEntries([normalizedEntry, ...entries])

  storage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(nextEntries))
  dispatchJournalUpdate()

  return normalizedEntry
}

export const updateJournalEntry = (entryId, updates) => {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  const entries = getJournalEntries()
  const existingEntry = entries.find((entry) => entry.id === entryId)

  if (!existingEntry) {
    return null
  }

  const updatedEntry = normalizeEntry({
    ...existingEntry,
    ...updates,
    id: existingEntry.id,
    date: existingEntry.date,
    time: existingEntry.time,
    createdAt: existingEntry.createdAt,
  })

  const nextEntries = sortEntries(
    entries.map((entry) => (entry.id === entryId ? updatedEntry : entry)),
  )

  storage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(nextEntries))
  dispatchJournalUpdate()

  return updatedEntry
}

export const deleteJournalEntry = (entryId) => {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  const nextEntries = getJournalEntries().filter((entry) => entry.id !== entryId)

  storage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(nextEntries))
  dispatchJournalUpdate()

  return nextEntries
}

export const JOURNAL_STORAGE_UPDATED_EVENT = JOURNAL_STORAGE_EVENT
