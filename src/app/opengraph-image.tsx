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
          background: 'linear-gradient(to bottom right, #f9fafb, #ffffff, #f1f5f9)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Invite badge */}
        <div
          style={{
            background: 'linear-gradient(to right, #2563eb, #9333ea)',
            color: 'white',
            padding: '24px 32px',
            borderRadius: 24,
            marginBottom: 32,
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
            ✨ 특별한 초대장이 도착했어요!
          </div>
          <div style={{ fontSize: 20, lineHeight: 1.5 }}>
            고객님의 애정템/옷장이 궁금하다고 초대하셨어요
          </div>
        </div>

        {/* Logo */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: 16,
            fontFamily: 'sans-serif',
          }}
        >
          CirQl
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 16,
            color: '#6b7280',
            marginBottom: 12,
            fontFamily: 'sans-serif',
          }}
        >
          옷장의 아끼는 옷부터 애정하는 액자까지.
        </div>

        {/* Main tagline */}
        <div
          style={{
            fontSize: 20,
            color: '#4b5563',
            fontWeight: 600,
            textAlign: 'center',
            marginBottom: 40,
            fontFamily: 'sans-serif',
          }}
        >
          친구의 애정템, 셀럽의 애정템 그리고 나의 애정템이 한곳에.
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            fontSize: 18,
            color: '#374151',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'white',
              padding: '16px 24px',
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ fontSize: 32 }}>💎</div>
            <div>애정템 공유</div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'white',
              padding: '16px 24px',
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ fontSize: 32 }}>💬</div>
            <div>찜 & 소통</div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'white',
              padding: '16px 24px',
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ fontSize: 32 }}>✨</div>
            <div>팔로우</div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            fontSize: 14,
            color: '#9ca3af',
            marginTop: 40,
            letterSpacing: '0.1em',
            fontFamily: 'sans-serif',
          }}
        >
          WHERE FAVORITES FIND NEW HOMES
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
