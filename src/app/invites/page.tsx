'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Invite {
  id: string
  code: string
  is_used: boolean
  used_at: string | null
  created_at: string
}

interface InviteQuota {
  total_invites: number
  used_invites: number
  remaining_invites: number
}

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [quota, setQuota] = useState<InviteQuota | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadInvites()
  }, [])

  const loadInvites = async () => {
    setLoading(true)
    setError(null)

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Load user's invites
    const { data: invitesData, error: invitesError } = await supabase
      .from('invites')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (invitesError) {
      setError('초대 코드를 불러오는데 실패했습니다.')
      setLoading(false)
      return
    }

    setInvites(invitesData || [])

    // Load user's quota
    const { data: quotaData, error: quotaError } = await supabase
      .from('user_invite_quota')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (quotaError) {
      console.error('Failed to load quota:', quotaError)
    } else {
      setQuota(quotaData)
    }

    setLoading(false)
  }

  const createInvite = async () => {
    if (!quota || quota.remaining_invites <= 0) {
      setError('남은 초대 코드가 없습니다.')
      return
    }

    setCreating(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Generate random code
    const randomCode = `CIRQL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const { error: insertError } = await supabase
      .from('invites')
      .insert({
        code: randomCode,
        created_by: user.id,
        is_used: false
      })

    if (insertError) {
      setError('초대 코드 생성에 실패했습니다.')
      setCreating(false)
      return
    }

    // Reload invites
    await loadInvites()
    setCreating(false)
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">초대 코드 관리</h1>
          <Link href="/feed" className="text-blue-600 hover:underline">
            피드로 돌아가기
          </Link>
        </div>

        {/* Quota Info */}
        {quota && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 font-medium">사용 가능한 초대 코드</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {quota.remaining_invites}
                </p>
              </div>
              <div className="text-right text-sm text-blue-700">
                <p>전체: {quota.total_invites}개</p>
                <p>사용됨: {quota.used_invites}개</p>
              </div>
            </div>
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={createInvite}
          disabled={creating || !quota || quota.remaining_invites <= 0}
          className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-6"
        >
          {creating ? '생성 중...' : '새 초대 코드 만들기'}
        </button>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Invites List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            내가 만든 초대 코드
          </h2>
          {invites.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              아직 생성한 초대 코드가 없습니다.
            </p>
          ) : (
            invites.map((invite) => (
              <div
                key={invite.id}
                className={`border rounded-lg p-4 ${
                  invite.is_used ? 'bg-gray-50 border-gray-300' : 'bg-white border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-mono text-lg font-bold text-gray-900">
                      {invite.code}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {invite.is_used ? (
                        <>
                          <span className="text-red-600 font-medium">사용됨</span>
                          {' • '}
                          {new Date(invite.used_at!).toLocaleString('ko-KR')}
                        </>
                      ) : (
                        <>
                          <span className="text-green-600 font-medium">사용 가능</span>
                          {' • '}
                          {new Date(invite.created_at).toLocaleDateString('ko-KR')} 생성
                        </>
                      )}
                    </p>
                  </div>
                  {!invite.is_used && (
                    <button
                      onClick={() => copyToClipboard(invite.code)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {copied === invite.code ? '복사됨!' : '복사'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
