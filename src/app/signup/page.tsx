'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Step 1: Validate invite code
    const { data: inviteData, error: inviteError } = await supabase
      .from('invites')
      .select('id, is_used')
      .eq('code', inviteCode.trim().toUpperCase())
      .single()

    if (inviteError || !inviteData) {
      setError('유효하지 않은 초대 코드입니다.')
      setLoading(false)
      return
    }

    if (inviteData.is_used) {
      setError('이미 사용된 초대 코드입니다.')
      setLoading(false)
      return
    }

    // Step 2: Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    // Step 3: Mark invite as used
    const { error: markError } = await supabase.rpc('mark_invite_used', {
      invite_code: inviteCode.trim().toUpperCase(),
      user_id: authData.user.id
    })

    if (markError) {
      console.error('Failed to mark invite as used:', markError)
      // Continue anyway - user is already created
    }

    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cirql</h1>
          <p className="text-gray-600 mt-2">나만의 옷장을 만들어보세요</p>
        </div>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="초대 코드 (필수)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-mono tracking-wider"
            />
            <p className="text-xs text-gray-500 mt-1">
              Cirql은 초대제로 운영됩니다
            </p>
          </div>
          <div>
            <input
              type="text"
              placeholder="사용자 이름"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              maxLength={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
