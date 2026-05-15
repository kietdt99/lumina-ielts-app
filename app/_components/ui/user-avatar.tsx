type UserAvatarProps = {
  avatarUrl?: string | null
  className?: string
  name: string
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'L'
  )
}

export function UserAvatar({ avatarUrl, className = '', name }: UserAvatarProps) {
  const avatarClassName = [
    'user-avatar',
    avatarUrl ? 'has-image' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      aria-label={`${name} avatar`}
      className={avatarClassName}
      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
    >
      {avatarUrl ? <span className="sr-only">{name}</span> : getInitials(name)}
    </span>
  )
}
