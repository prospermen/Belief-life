import fs from 'node:fs'
import path from 'node:path'

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

const envPath = path.resolve(process.cwd(), '.env')
loadDotEnvFile(envPath)

await import('./ai-server.mjs')

