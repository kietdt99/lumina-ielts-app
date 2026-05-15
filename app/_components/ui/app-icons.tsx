import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  title?: string
}

function BaseIcon({ title, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

export function DashboardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 5.5h6v6h-6z" />
      <path d="M13.5 5.5h6v4h-6z" />
      <path d="M13.5 12.5h6v6h-6z" />
      <path d="M4.5 14.5h6v4h-6z" />
    </BaseIcon>
  )
}

export function WritingIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 18.5h4l8.5-8.5-4-4L5 14.5z" />
      <path d="M12.5 7.5l4 4" />
      <path d="M4.5 19.5h15" />
    </BaseIcon>
  )
}

export function TrackerIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 18.5h15" />
      <path d="M7.5 15.5v-4" />
      <path d="M12 15.5v-8" />
      <path d="M16.5 15.5v-6" />
    </BaseIcon>
  )
}

export function ProfileIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 19.5a7 7 0 0 1 14 0" />
    </BaseIcon>
  )
}

export function TargetIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 8.5v7" />
      <path d="M8.5 12H15" />
    </BaseIcon>
  )
}

export function SparklesIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4.5 13.6 9l4.9 1.6L13.6 12l-1.6 4.5L10.4 12l-4.9-1.4L10.4 9z" />
      <path d="M18.5 4.5v2" />
      <path d="M19.5 5.5h-2" />
      <path d="M5.5 15.5v2" />
      <path d="M6.5 16.5h-2" />
    </BaseIcon>
  )
}

export function TrophyIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 4.5h8v3a4 4 0 0 1-8 0z" />
      <path d="M8 6H5.5a2 2 0 0 0 2 2.5H8" />
      <path d="M16 6h2.5a2 2 0 0 1-2 2.5H16" />
      <path d="M12 11.5v3" />
      <path d="M9 19.5h6" />
      <path d="M10 14.5h4" />
    </BaseIcon>
  )
}

export function CompassIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m14.5 9.5-2.2 5.2-5.3 2.2 2.3-5.2z" />
    </BaseIcon>
  )
}

export function TimerIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 13V9.5" />
      <path d="M12 13l2.6 1.7" />
      <path d="M9.5 4.5h5" />
    </BaseIcon>
  )
}

export function QuillIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M18.5 5.5c-2.5 0-5 1.4-6.6 3.7L7.5 15.5l-1 3 3-.9 6.3-4.4c2.3-1.6 3.7-4.1 3.7-6.6Z" />
      <path d="M8.5 17.5 6.5 15.5" />
    </BaseIcon>
  )
}

export function ChecklistIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 7h10" />
      <path d="M8 12h10" />
      <path d="M8 17h10" />
      <path d="m4.5 7 1.2 1.2L7.5 6" />
      <path d="m4.5 12 1.2 1.2L7.5 11" />
      <path d="m4.5 17 1.2 1.2L7.5 16" />
    </BaseIcon>
  )
}

export function RibbonIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="9" r="4.5" />
      <path d="m9.5 13 1 6 1.5-2 1.5 2 1-6" />
    </BaseIcon>
  )
}
