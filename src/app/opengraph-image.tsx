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
          background: 'linear-gradient(to bottom right, #1e40af, #581c87)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 30,
            fontFamily: 'sans-serif',
          }}
        >
          CirQl
        </div>

        {/* Main tagline */}
        <div
          style={{
            fontSize: 32,
            color: 'white',
            textAlign: 'center',
            marginBottom: 20,
            fontFamily: 'sans-serif',
            opacity: 0.95,
          }}
        >
          친구의 애정템, 셀럽의 애정템 그리고 나의 애정템이 한곳에.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 20,
            color: 'white',
            textAlign: 'center',
            fontFamily: 'sans-serif',
            opacity: 0.7,
            letterSpacing: '0.1em',
          }}
        >
          WHERE FAVORITES FIND NEW HOMES
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            marginTop: 50,
            gap: 30,
            fontSize: 18,
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💎</div>
            <div>애정템 공유</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
            <div>찜 & 소통</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
            <div>팔로우</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
