'use client'

export function CirqlLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  }

  return (
    <div 
      className={`${sizes[size]} font-black tracking-tight lowercase flex items-center`}
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <span className="text-zinc-900">cir</span>
      <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
        q
      </span>
      <span className="text-zinc-900">l</span>
    </div>
  )
}
