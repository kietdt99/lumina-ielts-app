export type LearnerProfile = {
  avatarUrl: string | null
  displayName: string
}

const maxAvatarDataUrlLength = 180_000
const supportedAvatarDataUrlPattern =
  /^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeAvatarUrl(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return {
      ok: true as const,
      avatarUrl: null,
    }
  }

  if (typeof value !== 'string') {
    return {
      ok: false as const,
      error: 'Avatar must be an image data URL.',
    }
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length > maxAvatarDataUrlLength) {
    return {
      ok: false as const,
      error: 'Avatar image is too large. Use an image under 120 KB.',
    }
  }

  if (!supportedAvatarDataUrlPattern.test(trimmedValue)) {
    return {
      ok: false as const,
      error: 'Avatar must be a PNG, JPG, JPEG, or WebP image.',
    }
  }

  return {
    ok: true as const,
    avatarUrl: trimmedValue,
  }
}

export function validateLearnerProfile(payload: unknown) {
  if (!isRecord(payload)) {
    return {
      ok: false as const,
      error: 'Profile payload must be an object.',
    }
  }

  if (typeof payload.displayName !== 'string') {
    return {
      ok: false as const,
      error: 'Display name is required.',
    }
  }

  const displayName = payload.displayName.trim()

  if (displayName.length < 2 || displayName.length > 80) {
    return {
      ok: false as const,
      error: 'Display name must be between 2 and 80 characters.',
    }
  }

  const avatarResult = normalizeAvatarUrl(payload.avatarUrl)

  if (!avatarResult.ok) {
    return avatarResult
  }

  return {
    ok: true as const,
    profile: {
      avatarUrl: avatarResult.avatarUrl,
      displayName,
    } satisfies LearnerProfile,
  }
}
