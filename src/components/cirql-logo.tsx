'use client'

export function CirqlLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  }

  return (
    <div 
      className={`${sizes[size]} font-black flex items-baseline italic`}
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        letterSpacing: '-0.03em',
      }}
    >
      <span className="text-zinc-900">C</span>
      <span className="text-zinc-900 lowercase">ir</span>
      <span 
        className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent"
        style={{ 
          fontSize: '1.1em',
          fontWeight: 900,
        }}
      >
        Q
      </span>
      <span className="text-zinc-900 lowercase">l</span>
      <span 
        className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 ml-0.5"
        style={{ marginBottom: '0.6em' }}
      />
    </div>
  )
}
