'use client'

export function CirqlLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { text: 'text-xl', circle: 16 },
    md: { text: 'text-2xl', circle: 20 },
    lg: { text: 'text-4xl', circle: 28 },
  }

  const { text, circle } = sizes[size]

  return (
    <div 
      className={`${text} font-black tracking-tight flex items-center gap-0.5`}
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* C with gradient */}
      <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
        c
      </span>
      
      {/* i */}
      <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
        i
      </span>
      
      {/* r */}
      <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
        r
      </span>
      
      {/* q - stylized */}
      <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
        q
      </span>
      
      {/* l */}
      <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
        l
      </span>

      {/* Spinning circle accent */}
      <svg 
        width={circle} 
        height={circle} 
        viewBox="0 0 24 24" 
        className="ml-1"
        style={{ marginBottom: '2px' }}
      >
        <defs>
          <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {/* Circular arrows - representing exchange/cycle */}
        <path 
          d="M12 4C7.58 4 4 7.58 4 12M12 20c4.42 0 8-3.58 8-8" 
          stroke="url(#circleGrad)" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          fill="none"
        />
        <path d="M12 1L12 7L6 4Z" fill="url(#circleGrad)" />
        <path d="M12 23L12 17L18 20Z" fill="url(#circleGrad)" />
      </svg>
    </div>
  )
}
