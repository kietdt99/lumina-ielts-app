import {
  getVisibleDemoCredentials,
  redirectAuthenticatedUserFromAuth,
} from '@/lib/auth/service'
import { WelcomeExperience } from '@/app/_components/welcome-experience'
import { readAppLanguageCookie } from '@/lib/i18n/app-language'

export default async function LoginPage() {
  const [, language] = await Promise.all([
    redirectAuthenticatedUserFromAuth(),
    readAppLanguageCookie(),
  ])

  return (
    <WelcomeExperience
      demoCredentials={getVisibleDemoCredentials()}
      initialLoginOpen
      initialLanguage={language}
    />
  )
}
