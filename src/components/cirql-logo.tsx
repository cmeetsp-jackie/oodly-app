'use client'

export function CirqlLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  }

  return (
    <div 
      className={`${sizes[size]} font-black lowercase flex items-baseline`}
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        letterSpacing: '-0.03em',
      }}
    >
      <span className="text-zinc-900">cir</span>
      <span 
        className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent relative"
        style={{ 
          fontSize: '1.15em',
          fontWeight: 900,
        }}
      >
        Q
      </span>
      <span className="text-zinc-900">l</span>
      <span 
        className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 ml-0.5"
        style={{ marginBottom: '0.5em' }}
      />
    </div>
  )
}
