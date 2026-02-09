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
        className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-800 bg-clip-text text-transparent"
        style={{ 
          fontSize: '1.1em',
          fontWeight: 900,
        }}
      >
        Q
      </span>
      <span 
        className="text-zinc-900 inline-block origin-top"
        style={{ 
          fontWeight: 900,
          transform: 'scaleY(1.3)',
          marginBottom: '-0.15em',
        }}
      >
        L
      </span>
    </div>
  )
}
