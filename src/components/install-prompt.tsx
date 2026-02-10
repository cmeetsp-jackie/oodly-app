'use client'

import { useState, useEffect } from 'react'

export function InstallPrompt() {
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Detect platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isAndroid = /Android/.test(navigator.userAgent)
    
    if (isIOS) {
      setPlatform('ios')
      setShowPrompt(true)
    } else if (isAndroid) {
      setPlatform('android')
      setShowPrompt(true)
    }
  }, [])

  if (!showPrompt || !platform) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mt-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📱</span>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-sm mb-1">
            앱으로 설치하기
          </h3>
          {platform === 'ios' && (
            <p className="text-xs text-gray-700 leading-relaxed">
              <span className="font-bold">Safari</span>로 이 링크를 열어주세요.<br />
              그 다음 Safari 하단의 <span className="font-bold">공유 버튼 (⬆️)</span>을 탭하고<br />
              <span className="font-bold">"홈 화면에 추가"</span>를 선택하세요
            </p>
          )}
          {platform === 'android' && (
            <p className="text-xs text-gray-700 leading-relaxed">
              <span className="font-bold">Chrome</span>으로 이 링크를 열어주세요.<br />
              주소창에 나타나는 <span className="font-bold">"설치"</span> 버튼을 탭하거나<br />
              오른쪽 상단 메뉴 (⋮) → <span className="font-bold">"홈 화면에 추가"</span>를 선택하세요
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            💡 앱으로 설치하면 더 빠르고 편리하게 사용할 수 있어요
          </p>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
