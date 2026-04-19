import { appSessionHintCookieName } from './cookie-names'

export function readSessionHintFromDocument() {
  if (typeof document === 'undefined') {
    return null
  }

  const cookieValue = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${appSessionHintCookieName}=`))
    ?.split('=')
    .slice(1)
    .join('=')

  return cookieValue ? decodeURIComponent(cookieValue) : null
}
