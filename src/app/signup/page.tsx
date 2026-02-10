'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // Get invite code from URL
  const inviteCode = searchParams.get('invite')

  useEffect(() => {
    if (!inviteCode) {
      setError('초대 코드가 필요합니다. 초대 링크를 통해 접속해주세요.')
    }
  }, [inviteCode])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!inviteCode) {
      setError('초대 코드가 필요합니다.')
      setLoading(false)
      return
    }

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Funtasi Lear Trial', 'Farmhouse', system-ui" }}>
            CirQL
          </h1>
          <p className="text-gray-600 text-sm">옷장의 아기는 옷부터 애정하는 액자까지.</p>
        </div>
        
        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="이름 (실명)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              maxLength={20}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
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
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button 
            type="submit" 
            disabled={loading || !inviteCode}
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-4"
          >
            {loading ? '가입 중...' : '시작하기'}
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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
