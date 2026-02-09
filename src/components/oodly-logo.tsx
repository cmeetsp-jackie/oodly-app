'use client'

export function OodlyLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { height: 24, fontSize: 'text-xl' },
    md: { height: 32, fontSize: 'text-2xl' },
    lg: { height: 48, fontSize: 'text-4xl' },
  }
  
  const { height, fontSize } = sizes[size]

  return (
    <div className="flex items-center gap-1">
      {/* Cute O with eyes */}
      <svg 
        height={height} 
        viewBox="0 0 40 40" 
        className="inline-block"
      >
        {/* O circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
        {/* Left eye */}
        <ellipse cx="13" cy="18" rx="4" ry="5" fill="white" />
        <circle cx="14" cy="18" r="2.5" fill="#1f2937" />
        <circle cx="15" cy="17" r="1" fill="white" />
        {/* Right eye */}
        <ellipse cx="27" cy="18" rx="4" ry="5" fill="white" />
        <circle cx="28" cy="18" r="2.5" fill="#1f2937" />
        <circle cx="29" cy="17" r="1" fill="white" />
        {/* Smile */}
        <path 
          d="M 14 26 Q 20 32 26 26" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          fill="none" 
        />
        {/* Blush */}
        <circle cx="8" cy="24" r="3" fill="#fca5a5" opacity="0.6" />
        <circle cx="32" cy="24" r="3" fill="#fca5a5" opacity="0.6" />
      </svg>
      
      {/* odly text */}
      <span className={`${fontSize} font-black tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent`}
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        odly
      </span>
    </div>
  )
}
