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
  const [postCount, setPostCount] = useState<number>(0)
  const [checkingPosts, setCheckingPosts] = useState(true)
  const supabase = createClient()
  
  const canCreateInvite = postCount >= 2

  // Fetch user's name and post count
  useEffect(() => {
    const fetchUserData = async () => {
      // Get user name
      const { data: userData } = await supabase
        .from('users')
        .select('display_name, username')
        .eq('id', userId)
        .single()

      if (userData) {
        setUserName(userData.display_name || userData.username || '친구')
      }

      // Get post count
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      setPostCount(count || 0)
      setCheckingPosts(false)
    }

    fetchUserData()
  }, [userId, supabase])

  const createInviteLink = async () => {
    if (!canCreateInvite) {
      setError(`애정템을 ${2 - postCount}개 더 올려주세요!`)
      return
    }
    
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

    // Update user_invite_quota (decrease remaining by 1)
    const newRemaining = remainingInvites - 1
    const newUsed = totalInvites - newRemaining
    
    const { error: quotaError } = await supabase
      .from('user_invite_quota')
      .update({
        used_invites: newUsed,
        remaining_invites: newRemaining,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (quotaError) {
      console.error('Failed to update invite quota:', quotaError)
      // Continue anyway - code is already created
    }

    // Create invite message with link
    const inviteLink = `${window.location.origin}/?invite=${randomCode}`
    const inviteMessage = `애정템/옷장이 궁금하다고 ${userName}님이 초대하셨어요 (초대장 통해서만 입장가능) ✨\n\n${inviteLink}`

    // Try Web Share API first (better for mobile)
    let copySuccess = false
    
    if (navigator.share) {
      try {
        await navigator.share({
          text: inviteMessage
        })
        copySuccess = true
      } catch (err: any) {
        // User cancelled share or share failed
        if (err.name !== 'AbortError') {
          console.log('Share failed, trying clipboard...')
        } else {
          // User cancelled - still count as success
          copySuccess = true
        }
      }
    }
    
    // If share not available or failed, try clipboard
    if (!copySuccess) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(inviteMessage)
          copySuccess = true
        } else {
          // Fallback for older browsers
          const textarea = document.createElement('textarea')
          textarea.value = inviteMessage
          textarea.style.position = 'fixed'
          textarea.style.top = '-9999px'
          textarea.style.left = '-9999px'
          document.body.appendChild(textarea)
          textarea.focus()
          textarea.select()
          
          const successful = document.execCommand('copy')
          document.body.removeChild(textarea)
          
          if (successful) {
            copySuccess = true
          }
        }
      } catch (err) {
        console.error('Copy failed:', err)
      }
    }
    
    if (copySuccess) {
      setCopied(true)
      setRemainingInvites(prev => prev - 1)
      setTimeout(() => setCopied(false), 3000)
    } else {
      setError('공유에 실패했습니다. 다시 시도해주세요.')
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

      {/* Post count requirement */}
      {!canCreateInvite && !checkingPosts && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-semibold text-amber-900 mb-1">
            ✋ 초대 조건이 필요해요
          </p>
          <p className="text-xs text-amber-700">
            먼저 애정템을 <span className="font-bold">2개 이상</span> 올려주세요! (현재: {postCount}개)
          </p>
        </div>
      )}

      {canCreateInvite && (
        <p className="text-sm text-gray-600 mb-4">
          애정템을 꼭 올려줬으면 하는 3명을 초대해보세요! ✨
        </p>
      )}

      {error && (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      )}

      {copied && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-3 text-sm leading-relaxed">
          ✅ 초대 링크가 준비되었습니다!<br />
          카톡/텔레그램에 붙여넣어보세요.
        </div>
      )}

      <button
        onClick={createInviteLink}
        disabled={loading || remainingInvites <= 0 || !canCreateInvite || checkingPosts}
        className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {checkingPosts 
          ? '확인 중...'
          : loading 
          ? '생성 중...' 
          : !canCreateInvite
          ? `애정템을 ${2 - postCount}개 더 올려주세요`
          : remainingInvites > 0 
          ? '초대 메시지 생성하기' 
          : '초대 가능 횟수를 모두 사용했습니다'}
      </button>

      {remainingInvites > 0 && canCreateInvite && (
        <p className="text-xs text-gray-500 text-center mt-3">
          버튼을 누르면 공유 화면이 열리거나 메시지가 복사됩니다
        </p>
      )}
    </div>
  )
}
