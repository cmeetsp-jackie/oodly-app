'use client'

export function OodlyLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  return (
    <div 
      className={`${sizes[size]} font-black tracking-tight`}
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontStyle: 'italic',
      }}
    >
      <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
        O
      </span>
      <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
        o
      </span>
      <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
        dly
      </span>
      <span className="ml-0.5 inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400" 
        style={{ verticalAlign: 'super', marginBottom: '0.3em' }} 
      />
    </div>
  )
}
