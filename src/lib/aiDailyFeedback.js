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
  const urls = ['/api/ai/daily-feedback']
  const configuredBaseURL = normalizeBaseURL(import.meta.env.VITE_AI_API_BASE_URL)
  const directBaseURL = normalizeBaseURL(getDirectBaseURL())

  if (configuredBaseURL) {
    urls.push(`${configuredBaseURL}/api/ai/daily-feedback`)
  }

  if (directBaseURL) {
    urls.push(`${directBaseURL}/api/ai/daily-feedback`)
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

const buildNetworkError = (requestURL, originalError) => {
  const originalMessage = originalError instanceof Error ? originalError.message : ''
  const shortURL = requestURL.replace(/^https?:\/\//, '')

  if (originalMessage.toLowerCase().includes('failed to fetch')) {
    return new Error(`无法连接 AI 服务（${shortURL}）。请确认后端已启动，并检查 8787 端口或跨域/混合内容限制。`)
  }

  return new Error(`请求 AI 服务失败（${shortURL}）：${originalMessage || '网络异常'}`)
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
    return new Error('AI 服务不可达，请确认 `npm run dev:api` 正在运行，并监听 8787 端口')
  }

  if (backendError) {
    return new Error(backendError)
  }

  if (rawText) {
    return new Error(`HTTP ${response.status}: ${rawText.slice(0, 160)}`)
  }

  return new Error(`HTTP ${response.status}: AI 请求失败`)
}

export const requestDailyJourneyFeedback = async (payload, options = {}) => {
  const requestURLs = getRequestURLs()
  let lastHttpError = null
  let lastNetworkError = null

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
      continue
    }

    const { rawBody, data } = await parseResponseBody(response)

    if (!response.ok) {
      lastHttpError = buildRequestError(response, rawBody, data)
      continue
    }

    return data
  }

  if (lastHttpError instanceof Error) {
    throw lastHttpError
  }

  if (lastNetworkError instanceof Error) {
    throw lastNetworkError
  }

  throw new Error('无法连接 AI 服务，请确认 `npm run dev:api` 正在运行，并检查 8787 端口是否可用')
}

