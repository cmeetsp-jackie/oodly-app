'use client'

export function OodlyLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { height: 20, fontSize: 'text-lg' },
    md: { height: 28, fontSize: 'text-xl' },
    lg: { height: 40, fontSize: 'text-3xl' },
  }
  
  const { height, fontSize } = sizes[size]

  // Cute face SVG component
  const CuteFace = () => (
    <svg 
      height={height} 
      width={height}
      viewBox="0 0 40 40" 
      className="inline-block"
    >
      <defs>
        <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#logoGradient1)" />
      {/* Left eye */}
      <ellipse cx="13" cy="17" rx="3.5" ry="4.5" fill="white" />
      <circle cx="14" cy="17" r="2" fill="#1f2937" />
      <circle cx="15" cy="16" r="0.8" fill="white" />
      {/* Right eye */}
      <ellipse cx="27" cy="17" rx="3.5" ry="4.5" fill="white" />
      <circle cx="28" cy="17" r="2" fill="#1f2937" />
      <circle cx="29" cy="16" r="0.8" fill="white" />
      {/* Smile */}
      <path 
        d="M 14 25 Q 20 30 26 25" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round"
        fill="none" 
      />
      {/* Blush */}
      <circle cx="9" cy="23" r="2.5" fill="#fca5a5" opacity="0.5" />
      <circle cx="31" cy="23" r="2.5" fill="#fca5a5" opacity="0.5" />
    </svg>
  )

  return (
    <div className="flex items-center" style={{ gap: '2px' }}>
      {/* Two cute O faces for "OO" */}
      <CuteFace />
      <CuteFace />
      
      {/* dly text */}
      <span 
        className={`${fontSize} font-black tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent`}
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif', marginLeft: '1px' }}
      >
        dly
      </span>
    </div>
  )
}
