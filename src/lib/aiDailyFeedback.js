const API_PATH = '/api/ai/daily-feedback'
const TEMP_BYPASS_DURATION_MS = 30_000

let remoteBypassUntil = 0

const HIGH_RISK_KEYWORDS = [
  '自杀',
  '自残',
  '轻生',
  '不想活',
  '伤害自己',
  'suicide',
  'kill myself',
  'self-harm',
]

const normalizeBaseURL = (baseURL) => {
  if (typeof baseURL !== 'string') {
    return ''
  }

  return baseURL.trim().replace(/\/$/, '')
}

const getDirectBaseURL = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:8787'
  }

  const { protocol, hostname } = window.location
  const safeHostname = hostname?.trim()

  if (!safeHostname) {
    return ''
  }

  if (protocol === 'http:') {
    return `http://${safeHostname}:8787`
  }

  if (safeHostname === 'localhost' || safeHostname === '127.0.0.1') {
    return 'http://localhost:8787'
  }

  return ''
}

const getRequestURLs = () => {
  const urls = [API_PATH]
  const configuredBaseURL = normalizeBaseURL(import.meta.env.VITE_AI_API_BASE_URL)
  const directBaseURL = normalizeBaseURL(getDirectBaseURL())

  if (configuredBaseURL) {
    urls.push(`${configuredBaseURL}${API_PATH}`)
  }

  if (directBaseURL) {
    urls.push(`${directBaseURL}${API_PATH}`)
  }

  return Array.from(new Set(urls))
}

const parseResponseBody = async (response) => {
  const rawBody = await response.text().catch(() => '')

  if (!rawBody) {
    return { rawBody: '', data: {} }
  }

  try {
    return {
      rawBody,
      data: JSON.parse(rawBody),
    }
  } catch {
    return { rawBody, data: {} }
  }
}

const clip = (value, maxLength) => {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()

  if (trimmed.length <= maxLength) {
    return trimmed
  }

  return `${trimmed.slice(0, maxLength)}...`
}

const containsHighRiskSignal = (userInput) => {
  const normalized = String(userInput ?? '').toLowerCase()
  return HIGH_RISK_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

const isServiceUnavailableStatus = (status) => {
  return status >= 500 || status === 404 || status === 429
}

const buildNetworkError = (requestURL, originalError) => {
  const originalMessage = originalError instanceof Error ? originalError.message : ''
  const shortURL = requestURL.replace(/^https?:\/\//, '')

  if (originalMessage.toLowerCase().includes('failed to fetch')) {
    return new Error(`Unable to reach AI service (${shortURL}). Check API server/proxy and port 8787.`)
  }

  return new Error(`AI request failed (${shortURL}): ${originalMessage || 'network error'}`)
}

const buildRequestError = (response, rawBody, data) => {
  const backendError = typeof data?.error === 'string' ? data.error.trim() : ''
  const rawText = rawBody.trim()
  const looksLikeProxyError = response.status >= 500
    && (
      rawText.toLowerCase().includes('proxy error')
      || rawText.includes('ECONNREFUSED')
      || rawText.toLowerCase().includes('connect')
    )

  if (looksLikeProxyError) {
    return new Error('AI service is not reachable. Make sure `npm run dev:api` is running on port 8787.')
  }

  if (backendError) {
    return new Error(backendError)
  }

  if (rawText) {
    return new Error(`HTTP ${response.status}: ${rawText.slice(0, 160)}`)
  }

  if (response.status >= 500) {
    return new Error('AI service temporarily unavailable (HTTP 500).')
  }

  return new Error(`HTTP ${response.status}: AI request failed`)
}

const shouldBypassRemoteRequest = () => {
  return Date.now() < remoteBypassUntil
}

const enableTemporaryBypass = () => {
  remoteBypassUntil = Date.now() + TEMP_BYPASS_DURATION_MS
}

const buildLocalFallbackFeedback = (payload, reason = 'service-unavailable') => {
  const userInput = String(payload?.userInput ?? '').trim()
  const stepLabel = String(payload?.context?.stepTitle ?? payload?.stepId ?? 'current step').trim()
  const shortInput = clip(userInput, 40)
  const highRisk = containsHighRiskSignal(userInput)

  if (highRisk) {
    return {
      ok: true,
      source: 'local-fallback',
      feedback: {
        encouragement: 'Thank you for sharing this. You do not need to handle it alone.',
        insight: 'Your text includes high-risk signals. Your safety comes first right now.',
        nextAction: 'Please use SOS immediately and contact a trusted person or local emergency support now.',
        followUpQuestion: 'Who is one person you can contact in the next 5 minutes?',
        riskFlag: 'high',
        riskReason: 'High-risk keywords detected in local fallback mode.',
        notice: 'AI service is temporarily unavailable. Showing local safety guidance.',
      },
    }
  }

  return {
    ok: true,
    source: 'local-fallback',
    feedback: {
      encouragement: 'You are pausing to observe yourself. That is a strong step.',
      insight: shortInput
        ? `At ${stepLabel}, I noticed this key point: "${shortInput}".`
        : `You are working on ${stepLabel}. Even one clear sentence is progress.`,
      nextAction: 'Try one slow breath cycle, then write one 10-minute actionable next step.',
      followUpQuestion: 'If you only do one tiny action now, what would it be?',
      riskFlag: 'none',
      riskReason: 'Fallback mode without explicit high-risk signals.',
      notice: reason === 'temporary-bypass'
        ? 'AI service is still recovering. Using local guidance for now.'
        : 'AI service is unavailable. Showing local guidance.',
    },
  }
}

export const requestDailyJourneyFeedback = async (payload, options = {}) => {
  const allowLocalFallback = options.allowLocalFallback !== false

  if (allowLocalFallback && shouldBypassRemoteRequest()) {
    return buildLocalFallbackFeedback(payload, 'temporary-bypass')
  }

  const requestURLs = getRequestURLs()
  let lastHttpError = null
  let lastNetworkError = null
  let shouldFallbackForAvailability = false

  for (const requestURL of requestURLs) {
    let response

    try {
      response = await fetch(requestURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: options.signal,
        body: JSON.stringify(payload),
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }

      lastNetworkError = buildNetworkError(requestURL, error)
      shouldFallbackForAvailability = true
      continue
    }

    const { rawBody, data } = await parseResponseBody(response)

    if (!response.ok) {
      lastHttpError = buildRequestError(response, rawBody, data)
      shouldFallbackForAvailability = shouldFallbackForAvailability || isServiceUnavailableStatus(response.status)
      continue
    }

    remoteBypassUntil = 0
    return data
  }

  if (allowLocalFallback && shouldFallbackForAvailability) {
    enableTemporaryBypass()
    return buildLocalFallbackFeedback(payload)
  }

  if (lastHttpError instanceof Error) {
    throw lastHttpError
  }

  if (lastNetworkError instanceof Error) {
    throw lastNetworkError
  }

  if (allowLocalFallback) {
    enableTemporaryBypass()
    return buildLocalFallbackFeedback(payload)
  }

  throw new Error('Unable to connect to AI service.')
}
