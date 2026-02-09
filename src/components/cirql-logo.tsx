'use client'

export function CirqlLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  }

  return (
    <div 
      className={`${sizes[size]} font-black tracking-tighter uppercase`}
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontStyle: 'italic',
        letterSpacing: '-0.05em',
      }}
    >
      <span 
        className="bg-gradient-to-r from-black via-zinc-800 to-black bg-clip-text text-transparent"
        style={{
          WebkitTextStroke: '0.5px rgba(0,0,0,0.1)',
        }}
      >
        CIRQL
      </span>
      <span 
        className="inline-block w-2 h-2 ml-0.5 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500"
        style={{ verticalAlign: 'super' }}
      />
    </div>
  )
}
