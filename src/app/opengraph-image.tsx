import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Cirql - 애정템이 모이는 곳'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #581c87 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Logo text */}
        <div
          style={{
            fontSize: 160,
            fontWeight: 'bold',
            color: 'white',
            fontStyle: 'italic',
            letterSpacing: '-0.02em',
            marginBottom: '40px',
          }}
        >
          <span style={{ textTransform: 'uppercase' }}>C</span>
          ir
          <span style={{ 
            background: 'linear-gradient(to bottom, #fff, #a78bfa)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            textTransform: 'uppercase'
          }}>Q</span>
          l<span style={{ fontSize: '60px', marginLeft: '8px' }}>·</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 38,
            color: 'rgba(255, 255, 255, 0.95)',
            textAlign: 'center',
            marginBottom: '20px',
            fontWeight: 600,
          }}
        >
          친구의 애정템, 셀럽의 애정템 그리고 나의 애정템이 한곳에.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.75)',
            textAlign: 'center',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          Where favorites find new homes
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: '60px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: 40 }}>💎</span>
            <span style={{ fontSize: 24, color: 'white', fontWeight: 600 }}>애정템 공유</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: 40 }}>💬</span>
            <span style={{ fontSize: 24, color: 'white', fontWeight: 600 }}>찜 & 소통</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: 40 }}>✨</span>
            <span style={{ fontSize: 24, color: 'white', fontWeight: 600 }}>팔로우</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
