'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface InviteSectionProps {
  userId: string
  remainingInvites: number
  totalInvites: number
}

export function InviteSection({ userId, remainingInvites: initialRemaining, totalInvites }: InviteSectionProps) {
  const [remainingInvites, setRemainingInvites] = useState(initialRemaining)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const supabase = createClient()

  // Fetch user's name
  useEffect(() => {
    const fetchUserName = async () => {
      const { data } = await supabase
        .from('users')
        .select('display_name, username')
        .eq('id', userId)
        .single()

      if (data) {
        setUserName(data.display_name || data.username || '친구')
      }
    }

    fetchUserName()
  }, [userId, supabase])

  const createInviteLink = async () => {
    if (remainingInvites <= 0) {
      setError('남은 초대 코드가 없습니다.')
      return
    }

    setLoading(true)
    setError(null)

    // Generate random code
    const randomCode = `CIRQL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const { error: insertError } = await supabase
      .from('invites')
      .insert({
        code: randomCode,
        created_by: userId,
        is_used: false
      })

    if (insertError) {
      setError('초대 링크 생성에 실패했습니다.')
      setLoading(false)
      return
    }

    // Create invite message with link
    const inviteLink = `${window.location.origin}/?invite=${randomCode}`
    const inviteMessage = `애정템/옷장이 가장 궁금한 3인이셔서 ${userName}님에게 초대받으셨어요 ✨\n\n${inviteLink}`

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(inviteMessage)
      setCopied(true)
      setRemainingInvites(prev => prev - 1)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      setError('링크 복사에 실패했습니다.')
    }

    setLoading(false)
  }

  return (
    <div className="bg-white p-6 mt-0.5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">친구 초대하기</h2>
        <div className="text-sm">
          <span className="text-gray-500">남은 초대: </span>
          <span className="font-bold text-blue-600">{remainingInvites}</span>
          <span className="text-gray-400">/{totalInvites}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        애정템을 꼭 올려줬으면 하는 3명을 초대해보세요! ✨
      </p>

      {error && (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      )}

      {copied && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-3 text-sm leading-relaxed">
          ✅ 초대 메시지가 복사되었습니다!<br />
          카톡/텔레그램에 바로 붙여넣어보세요.
        </div>
      )}

      <button
        onClick={createInviteLink}
        disabled={loading || remainingInvites <= 0}
        className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '생성 중...' : remainingInvites > 0 ? '초대 메시지 생성하기' : '초대 가능 횟수를 모두 사용했습니다'}
      </button>

      {remainingInvites > 0 && (
        <p className="text-xs text-gray-500 text-center mt-3">
          버튼을 누르면 초대 메시지가 자동으로 복사됩니다
        </p>
      )}
    </div>
  )
}
