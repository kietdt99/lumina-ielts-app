import type { SVGProps } from 'react'

type IllustrationProps = SVGProps<SVGSVGElement> & {
  title?: string
}

function BaseIllustration({
  title,
  children,
  ...props
}: IllustrationProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 280 220"
      fill="none"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

export function LoginIllustration(props: IllustrationProps) {
  return (
    <BaseIllustration {...props}>
      <circle cx="64" cy="54" r="28" fill="color-mix(in srgb, var(--primary) 18%, white)" />
      <circle cx="218" cy="74" r="18" fill="color-mix(in srgb, var(--accent) 78%, white)" />
      <rect x="34" y="86" width="212" height="108" rx="28" fill="rgba(255,255,255,0.66)" stroke="color-mix(in srgb, var(--primary) 16%, white)" />
      <rect x="62" y="112" width="156" height="16" rx="8" fill="color-mix(in srgb, var(--primary) 16%, white)" />
      <rect x="62" y="140" width="116" height="16" rx="8" fill="color-mix(in srgb, var(--accent) 88%, white)" />
      <rect x="62" y="168" width="72" height="14" rx="7" fill="color-mix(in srgb, var(--primary) 34%, white)" />
      <path d="M184 38c12 4 20 12 24 24" stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" />
      <path d="M204 32c7 2 13 7 16 14" stroke="var(--accent-foreground)" strokeWidth="5" strokeLinecap="round" />
    </BaseIllustration>
  )
}

export function EmptyStateIllustration(props: IllustrationProps) {
  return (
    <BaseIllustration {...props}>
      <circle cx="72" cy="68" r="26" fill="color-mix(in srgb, var(--accent) 80%, white)" />
      <circle cx="214" cy="54" r="20" fill="color-mix(in srgb, var(--primary) 16%, white)" />
      <path d="M58 162c10-38 38-58 82-58 42 0 74 20 96 58" stroke="color-mix(in srgb, var(--primary) 24%, white)" strokeWidth="12" strokeLinecap="round" />
      <rect x="82" y="86" width="116" height="86" rx="24" fill="rgba(255,255,255,0.68)" stroke="color-mix(in srgb, var(--primary) 18%, white)" />
      <path d="M110 116h60" stroke="var(--primary)" strokeWidth="10" strokeLinecap="round" />
      <path d="M110 142h42" stroke="var(--accent-foreground)" strokeWidth="10" strokeLinecap="round" />
      <circle cx="186" cy="144" r="12" fill="color-mix(in srgb, var(--primary) 18%, white)" />
    </BaseIllustration>
  )
}

export function AdminIllustration(props: IllustrationProps) {
  return (
    <BaseIllustration {...props}>
      <rect x="44" y="54" width="192" height="124" rx="28" fill="rgba(255,255,255,0.68)" stroke="color-mix(in srgb, var(--primary) 18%, white)" />
      <rect x="66" y="80" width="148" height="18" rx="9" fill="color-mix(in srgb, var(--primary) 18%, white)" />
      <rect x="66" y="112" width="116" height="14" rx="7" fill="color-mix(in srgb, var(--accent) 86%, white)" />
      <rect x="66" y="140" width="88" height="14" rx="7" fill="color-mix(in srgb, var(--primary) 24%, white)" />
      <circle cx="208" cy="142" r="18" fill="color-mix(in srgb, var(--primary) 16%, white)" />
      <path d="M208 132v20" stroke="var(--accent-foreground)" strokeWidth="6" strokeLinecap="round" />
      <path d="M198 142h20" stroke="var(--accent-foreground)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="86" cy="38" r="18" fill="color-mix(in srgb, var(--accent) 84%, white)" />
    </BaseIllustration>
  )
}
