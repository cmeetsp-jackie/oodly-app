import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(90deg, #2563eb, #9333ea)',
            color: 'white',
            padding: '30px 40px',
            borderRadius: '20px',
            marginBottom: '40px',
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          ✨ 특별한 초대장이 도착했어요!
        </div>
        
        <div style={{ fontSize: '90px', fontWeight: 'bold', marginBottom: '20px' }}>
          CirQl
        </div>
        
        <div style={{ fontSize: '24px', color: '#334155', marginBottom: '15px' }}>
          친구의 애정템, 셀럽의 애정템 그리고 나의 애정템이 한곳에.
        </div>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '15px 25px', borderRadius: '10px' }}>
            <span style={{ fontSize: '32px' }}>💎</span>
            <span style={{ fontSize: '18px' }}>애정템 공유</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '15px 25px', borderRadius: '10px' }}>
            <span style={{ fontSize: '32px' }}>💬</span>
            <span style={{ fontSize: '18px' }}>찜 & 소통</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '15px 25px', borderRadius: '10px' }}>
            <span style={{ fontSize: '32px' }}>✨</span>
            <span style={{ fontSize: '18px' }}>팔로우</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
