'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { AppLanguage } from '@/lib/i18n/app-language'

type LanguageSwitchProps = {
  currentLanguage: AppLanguage
  label: string
}

export function LanguageSwitch({
  currentLanguage,
  label,
}: LanguageSwitchProps) {
  const router = useRouter()
  const [pendingLanguage, setPendingLanguage] = useState<AppLanguage | null>(null)

  async function updateLanguage(language: AppLanguage) {
    if (language === currentLanguage || pendingLanguage) {
      return
    }

    setPendingLanguage(language)

    try {
      await fetch('/api/preferences/language', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
        }),
      })
      router.refresh()
    } finally {
      setPendingLanguage(null)
    }
  }

  return (
    <div className="sidebar-language-switch" aria-label={label}>
      {(['vi', 'en'] as const).map((language) => (
        <button
          key={language}
          type="button"
          className={`sidebar-language-button${
            language === currentLanguage ? ' is-active' : ''
          }`}
          disabled={pendingLanguage !== null}
          onClick={() => {
            void updateLanguage(language)
          }}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
