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
      <span className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
        O
      </span>
      <span className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-800 bg-clip-text text-transparent">
        o
      </span>
      <span className="bg-gradient-to-r from-indigo-900 to-slate-700 bg-clip-text text-transparent">
        dly
      </span>
      <span className="ml-0.5 inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-800 to-indigo-900" 
        style={{ verticalAlign: 'super', marginBottom: '0.3em' }} 
      />
    </div>
  )
}
