import { redirect } from 'next/navigation'
import { WelcomeExperience } from '@/app/_components/welcome-experience'
import {
  getAppSession,
  getVisibleDemoCredentials,
  resolvePostLoginPath,
} from '@/lib/auth/service'
import { readAppLanguageCookie } from '@/lib/i18n/app-language'

export default async function WelcomePage() {
  const [session, language] = await Promise.all([
    getAppSession(),
    readAppLanguageCookie(),
  ])

  if (session) {
    redirect(resolvePostLoginPath(session))
  }

  return (
    <WelcomeExperience
      demoCredentials={getVisibleDemoCredentials()}
      initialLanguage={language}
    />
  )
}
