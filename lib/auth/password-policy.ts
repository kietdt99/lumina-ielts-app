import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const passwordMinLength = 12
const uppercasePattern = /[A-Z]/
const lowercasePattern = /[a-z]/
const numberPattern = /[0-9]/
const symbolPattern = /[^A-Za-z0-9]/

export const passwordPolicy = {
  minLength: passwordMinLength,
}

export function validatePassword(password: string) {
  if (password.length < passwordMinLength) {
    return {
      ok: false as const,
      error: `Password must be at least ${passwordMinLength} characters long.`,
    }
  }

  if (!uppercasePattern.test(password)) {
    return {
      ok: false as const,
      error: 'Password must include at least one uppercase letter.',
    }
  }

  if (!lowercasePattern.test(password)) {
    return {
      ok: false as const,
      error: 'Password must include at least one lowercase letter.',
    }
  }

  if (!numberPattern.test(password)) {
    return {
      ok: false as const,
      error: 'Password must include at least one number.',
    }
  }

  if (!symbolPattern.test(password)) {
    return {
      ok: false as const,
      error: 'Password must include at least one symbol.',
    }
  }

  return {
    ok: true as const,
  }
}

export function generateTemporaryPassword() {
  while (true) {
    const candidate = [
      'Lm',
      randomBytes(4).toString('base64url'),
      '!',
      randomBytes(3).toString('hex').toUpperCase(),
      '9a',
    ].join('')

    if (validatePassword(candidate).ok) {
      return candidate
    }
  }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, digest: string) {
  const [salt, expectedHash] = digest.split(':')

  if (!salt || !expectedHash) {
    return false
  }

  const passwordBuffer = scryptSync(password, salt, 64)
  const expectedBuffer = Buffer.from(expectedHash, 'hex')

  return (
    passwordBuffer.length === expectedBuffer.length &&
    timingSafeEqual(passwordBuffer, expectedBuffer)
  )
}
