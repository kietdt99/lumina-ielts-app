import type { ReactNode } from 'react'
import {
  CompassIcon,
  RibbonIcon,
  TargetIcon,
} from '@/app/_components/ui/app-icons'

type StatusCalloutProps = {
  variant: 'info' | 'success' | 'error'
  title?: string
  children: ReactNode
  actions?: ReactNode
}

export function StatusCallout({
  variant,
  title,
  children,
  actions,
}: StatusCalloutProps) {
  const accessibilityProps =
    variant === 'error'
      ? { role: 'alert' as const }
      : { role: 'status' as const, 'aria-live': 'polite' as const }

  const icon =
    variant === 'success' ? (
      <RibbonIcon className="status-callout-icon" />
    ) : variant === 'error' ? (
      <TargetIcon className="status-callout-icon" />
    ) : (
      <CompassIcon className="status-callout-icon" />
    )

  return (
    <div
      className={`feedback-banner ${variant}-banner status-callout`}
      {...accessibilityProps}
    >
      <div className="status-callout-header">
        {icon}
        {title ? <strong>{title}</strong> : null}
      </div>
      <div className="status-callout-body">{children}</div>
      {actions ? <div className="status-callout-actions">{actions}</div> : null}
    </div>
  )
}
