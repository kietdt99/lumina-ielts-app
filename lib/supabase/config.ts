function isPlaceholder(value: string | undefined) {
  if (!value) {
    return true
  }

  return /\[YOUR-PROJECT-ID\]|your-project|your-anon-key|placeholder|example/i.test(
    value
  )
}

function isValidUrl(value: string | undefined) {
  if (!value || isPlaceholder(value)) {
    return false
  }

  try {
    const parsedUrl = new URL(value)
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:'
  } catch {
    return false
  }
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isValidUrl(url) || !anonKey || isPlaceholder(anonKey)) {
    return null
  }

  return {
    url: url as string,
    anonKey: anonKey as string,
  }
}

export function isSupabaseConfigured() {
  return getSupabaseConfig() !== null
}
