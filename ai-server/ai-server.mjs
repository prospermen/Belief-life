import fs from 'node:fs'
import { promises as fsPromises } from 'node:fs'
import path from 'node:path'
import { createServer } from 'node:http'
import OpenAI from 'openai'

const parseEnvValue = (rawValue) => {
  if (typeof rawValue !== 'string') {
    return ''
  }

  const trimmed = rawValue.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith('\'') && trimmed.endsWith('\''))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

const loadDotEnvFile = (envPath) => {
  if (!fs.existsSync(envPath)) {
    return
  }

  const content = fs.readFileSync(envPath, 'utf8')
  const lines = content.split(/\r?\n/)

  lines.forEach((line) => {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      return
    }

    const separatorIndex = trimmed.indexOf('=')

    if (separatorIndex <= 0) {
      return
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = parseEnvValue(trimmed.slice(separatorIndex + 1))

    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      return
    }

    process.env[key] = value
  })
}

loadDotEnvFile(path.resolve(process.cwd(), '.env'))

const PORT = Number.parseInt(process.env.PORT ?? process.env.AI_API_PORT ?? '8787', 10)
const HOST = process.env.HOST ?? '0.0.0.0'
const API_ONLY = process.env.API_ONLY === 'true'
const AI_PROVIDER = process.env.AI_PROVIDER ?? 'deepseek'
const AI_API_KEY = process.env.DEEPSEEK_API_KEY ?? process.env.OPENAI_API_KEY ?? ''
const AI_MODEL = process.env.OPENAI_MODEL ?? 'deepseek-chat'
const AI_BASE_URL = (process.env.OPENAI_BASE_URL ?? 'https://api.deepseek.com').replace(/\/$/, '')
const ALLOW_ORIGIN = process.env.AI_ALLOW_ORIGIN ?? '*'
const MOCK_AI = process.env.MOCK_AI === 'true'

const WEB_DIST_DIR = path.resolve(process.cwd(), process.env.WEB_DIST_DIR ?? 'dist')
const WEB_INDEX_FILE = path.join(WEB_DIST_DIR, 'index.html')
const HAS_WEB_DIST = !API_ONLY && fs.existsSync(WEB_INDEX_FILE)

const MAX_BODY_SIZE = 1024 * 32
let aiClient = null

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  })
  response.end(JSON.stringify(payload))
}

const sendFile = async (response, filePath) => {
  try {
    const stat = await fsPromises.stat(filePath)

    if (!stat.isFile()) {
      return false
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'
    const content = await fsPromises.readFile(filePath)

    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    })
    response.end(content)
    return true
  } catch {
    return false
  }
}

const readJsonBody = (request) => {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk

      if (body.length > MAX_BODY_SIZE) {
        reject(new Error('Payload too large'))
        request.destroy()
      }
    })

    request.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })

    request.on('error', (error) => {
      reject(error)
    })
  })
}

const validateFeedbackPayload = (payload) => {
  const activityType = String(payload?.activityType ?? '').trim()
  const stepId = String(payload?.stepId ?? '').trim()
  const userInput = String(payload?.userInput ?? '').trim()
  const context = payload?.context && typeof payload.context === 'object' ? payload.context : {}
  const userProfile = payload?.userProfile && typeof payload.userProfile === 'object' ? payload.userProfile : {}

  if (!activityType) {
    return { ok: false, message: 'activityType 不能为空' }
  }

  if (!stepId) {
    return { ok: false, message: 'stepId 不能为空' }
  }

  if (!userInput) {
    return { ok: false, message: 'userInput 不能为空' }
  }

  if (userInput.length > 4000) {
    return { ok: false, message: 'userInput 过长，请控制在 4000 字内' }
  }

  return {
    ok: true,
    value: {
      activityType,
      stepId,
      userInput,
      context,
      userProfile,
    },
  }
}

const buildSystemPrompt = () => {
  return `你是一位心理健康练习助手，服务于 Daily Journey 场景。
规则：1) 语气温和、具体、可执行，不做医学诊断。2) 输出必须是 JSON 对象，不要输出 markdown。3) JSON 字段固定为：
{
  "encouragement": "一句鼓励（<=40字）",
  "insight": "对用户内容的观察（<=80字）",
  "nextAction": "下一步建议（<=60字）",
  "followUpQuestion": "一个继续探索的问题（<=50字）",
  "riskFlag": "none|mild|high",
  "riskReason": "风险判断简述（<=40字）"
}
4) 若用户表达明显自伤/他伤倾向，riskFlag 必须为 high，且 nextAction 聚焦立即求助。`
}

const buildUserPrompt = (payload) => {
  return JSON.stringify({
    scene: 'daily_journey',
    ...payload,
  })
}

const buildMockFeedback = (payload) => {
  return {
    encouragement: '你已经在认真面对自己的感受，这很重要。',
    insight: `我看到你在“${payload.stepId}”这一步有明显投入，且能清晰表达当前状态。`,
    nextAction: '先做一次缓慢呼吸，然后写下一个 10 分钟内可执行的小行动。',
    followUpQuestion: '如果今天只完成一件最小行动，你希望是哪一件？',
    riskFlag: 'none',
    riskReason: '未检测到明显高风险表达。',
  }
}

const tryParseJson = (text) => {
  if (!text || typeof text !== 'string') {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    const matched = text.match(/\{[\s\S]*\}/)
    if (!matched) {
      return null
    }

    try {
      return JSON.parse(matched[0])
    } catch {
      return null
    }
  }
}

const getAIClient = () => {
  if (!aiClient) {
    aiClient = new OpenAI({
      baseURL: AI_BASE_URL,
      apiKey: AI_API_KEY,
    })
  }

  return aiClient
}

const requestOpenAIFeedback = async (payload) => {
  const completion = await getAIClient().chat.completions.create({
    model: AI_MODEL,
    temperature: 0.6,
    max_tokens: 160,
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(),
      },
      {
        role: 'user',
        content: buildUserPrompt(payload),
      },
    ],
  })

  const content = completion?.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('AI 返回为空')
  }

  const parsed = tryParseJson(content)
  if (!parsed) {
    throw new Error('AI 返回内容不是合法 JSON')
  }

  return {
    encouragement: String(parsed.encouragement ?? '').trim(),
    insight: String(parsed.insight ?? '').trim(),
    nextAction: String(parsed.nextAction ?? '').trim(),
    followUpQuestion: String(parsed.followUpQuestion ?? '').trim(),
    riskFlag: ['none', 'mild', 'high'].includes(parsed.riskFlag) ? parsed.riskFlag : 'none',
    riskReason: String(parsed.riskReason ?? '').trim(),
  }
}

const tryServeWeb = async (response, requestPathname) => {
  if (!HAS_WEB_DIST) {
    return false
  }

  const cleanedPath = requestPathname === '/' ? '/index.html' : requestPathname
  const resolvedPath = path.resolve(WEB_DIST_DIR, `.${cleanedPath}`)

  if (!resolvedPath.startsWith(WEB_DIST_DIR)) {
    return false
  }

  const servedAsset = await sendFile(response, resolvedPath)
  if (servedAsset) {
    return true
  }

  const fallbackToIndex = await sendFile(response, WEB_INDEX_FILE)
  return fallbackToIndex
}

const server = createServer(async (request, response) => {
  if (!request.url || !request.method) {
    sendJson(response, 400, { error: 'Invalid request' })
    return
  }

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`)

  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, {
      ok: true,
      service: 'daily-journey-ai-api',
      provider: AI_PROVIDER,
      model: AI_MODEL,
      baseURL: AI_BASE_URL,
      mock: MOCK_AI,
      hasWebDist: HAS_WEB_DIST,
      timestamp: new Date().toISOString(),
    })
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/ai/daily-feedback') {
    try {
      const payload = await readJsonBody(request)
      const validation = validateFeedbackPayload(payload)

      if (!validation.ok) {
        sendJson(response, 400, { error: validation.message })
        return
      }

      if (MOCK_AI) {
        sendJson(response, 200, {
          ok: true,
          source: 'mock',
          feedback: buildMockFeedback(validation.value),
        })
        return
      }

      if (!AI_API_KEY) {
        sendJson(response, 500, {
          error: '缺少 DEEPSEEK_API_KEY（或 OPENAI_API_KEY 兼容变量），请先配置环境变量',
        })
        return
      }

      const feedback = await requestOpenAIFeedback(validation.value)
      sendJson(response, 200, {
        ok: true,
        source: 'openai',
        feedback,
      })
      return
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : '接口异常',
      })
      return
    }
  }

  if (url.pathname.startsWith('/api/')) {
    sendJson(response, 404, { error: 'Not Found' })
    return
  }

  if (request.method === 'GET' || request.method === 'HEAD') {
    const served = await tryServeWeb(response, url.pathname)

    if (served) {
      return
    }
  }

  sendJson(response, 404, { error: 'Not Found' })
})

server.listen(PORT, HOST, () => {
  console.log(`AI API running on http://${HOST}:${PORT}`)

  if (API_ONLY) {
    console.log('Web static hosting disabled (API_ONLY=true)')
    return
  }

  console.log(`Web static root: ${HAS_WEB_DIST ? WEB_DIST_DIR : 'not found (run npm run build first)'}`)
})
