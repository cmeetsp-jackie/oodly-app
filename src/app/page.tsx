'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { CirqlLogo } from '@/components/cirql-logo'

type View = 'landing' | 'signup' | 'login' | 'forgot'

function HomeContent() {
  const [view, setView] = useState<View>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [resetSent, setResetSent] = useState(false)
  const [signupComplete, setSignupComplete] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // Get invite code from URL
  const inviteCode = searchParams.get('invite')
  const [inviterName, setInviterName] = useState<string | null>(null)

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/feed')
      } else {
        setCheckingAuth(false)
      }
    })
  }, [router, supabase.auth])

  // Fetch inviter name if invite code exists
  useEffect(() => {
    if (!inviteCode) return

    const fetchInviter = async () => {
      const { data: invite } = await supabase
        .from('invites')
        .select('created_by')
        .eq('code', inviteCode.toUpperCase())
        .single()

      if (invite?.created_by) {
        const { data: user } = await supabase
          .from('users')
          .select('username, display_name')
          .eq('id', invite.created_by)
          .single()

        if (user) {
          setInviterName(user.display_name || user.username)
        }
      }
    }

    fetchInviter()
  }, [inviteCode, supabase])

  // Show nothing while checking auth
  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-100">
        <div className="text-center animate-pulse">
          <CirqlLogo size="lg" />
        </div>
      </div>
    )
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setUsername('')
    setError(null)
    setResetSent(false)
    setSignupComplete(false)
  }

  // Email verification success screen
  if (signupComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-slate-100">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">📧</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">이메일을 확인해주세요!</h1>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold text-slate-800">{email}</span>으로<br />
              인증 링크를 보냈습니다.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            이메일의 링크를 클릭하면 가입이 완료됩니다.
          </p>
          <button
            onClick={() => { resetForm(); setView('login') }}
            className="text-slate-800 font-semibold hover:underline"
          >
            로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!inviteCode) {
      setError('초대 코드가 필요합니다. 초대 링크를 통해 접속해주세요.')
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
      options: { data: { username } }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('회원가입에 실패했습니다.')
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
    }

    // Go directly to feed
    router.push('/feed')
    router.refresh()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/feed')
    router.refresh()
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('이메일을 입력해주세요.')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setResetSent(true)
    setLoading(false)
  }

  // Landing View
  if (view === 'landing') {
    return (
      <div className="min-h-screen flex flex-col p-4 pt-12 bg-gradient-to-br from-gray-50 via-white to-slate-100">
        <div className="max-w-md w-full mx-auto text-center space-y-5">
          {/* Special invite indicator */}
          {inviteCode && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-4 rounded-2xl shadow-lg">
              <p className="text-base font-bold mb-1">✨ 특별한 초대장이 도착했어요!</p>
              <p className="text-sm leading-relaxed">
                고객님의 애정템/옷장이 궁금하다고<br />
                {inviterName ? (
                  <><span className="font-bold">{inviterName}</span>님이 초대하셨어요</>
                ) : (
                  <>초대를 받으셨어요</>
                )}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-center">
              <CirqlLogo size="lg" />
            </div>
            <p className="text-gray-500 text-xs">옷장의 아끼는 옷부터 애정하는 액자까지.</p>
            <p className="text-gray-600 text-sm font-medium">친구의 애정템, 셀럽의 애정템 그리고 나의 애정템이 한곳에.</p>
          </div>

          <div className="space-y-2 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
              <span className="text-xl">💎</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">애정템 공유</h3>
                <p className="text-xs text-gray-500">내 애정템을 자랑하고 판매해요</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
              <span className="text-xl">💬</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">찜하고 소통하고 득템까지</h3>
                <p className="text-xs text-gray-500">마음에 드는 아이템 찜하고 소통하고 득템까지!</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
              <span className="text-xl">✨</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">팔로우</h3>
                <p className="text-xs text-gray-500">취향 맞는 셀러를 팔로우하세요</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <Button 
              onClick={() => { 
                if (!inviteCode) {
                  setError('초대 링크를 통해 접속해주세요. Cirql은 초대제로 운영됩니다.')
                  return
                }
                resetForm(); 
                setView('signup') 
              }}
              className={`w-full font-bold py-5 text-base rounded-xl border-0 shadow-lg ${
                inviteCode 
                  ? 'bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-slate-900 text-white shadow-blue-800/25'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              size="lg"
              disabled={!inviteCode}
            >
              {inviteCode ? '서클 시작하기' : '초대 코드가 필요합니다'}
            </Button>
            <Button 
              onClick={() => { resetForm(); setView('login') }}
              variant="outline" 
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-5 text-base rounded-xl font-semibold" 
              size="lg"
            >
              로그인
            </Button>
          </div>
          
          {!inviteCode && (
            <p className="text-xs text-center text-gray-500 mt-2">
              💡 Cirql은 초대제로 운영됩니다. 초대 링크를 받으신 후 다시 접속해주세요.
            </p>
          )}

          <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">
            Where favorites find new homes
          </p>
        </div>
      </div>
    )
  }

  // Auth Form View (Signup or Login)
  return (
    <div className="min-h-screen flex flex-col p-4 pt-2 bg-gradient-to-br from-gray-50 via-white to-slate-100">
      <div className="max-w-md w-full mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-3">
          <button 
            onClick={() => { resetForm(); setView('landing') }}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Feature highlights - compact */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-100">
            <span className="text-base">💎</span>
            <span className="text-xs font-medium text-gray-700">애정템 공유</span>
          </div>
          <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-100">
            <span className="text-base">💬</span>
            <span className="text-xs font-medium text-gray-700">찜&소통</span>
          </div>
          <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-100">
            <span className="text-base">✨</span>
            <span className="text-xs font-medium text-gray-700">팔로우</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => { resetForm(); setView('signup') }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              view === 'signup' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            시작하기
          </button>
          <button
            onClick={() => { resetForm(); setView('login') }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              (view === 'login' || view === 'forgot')
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            로그인
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-1">
            <CirqlLogo size="md" />
          </div>
          {view === 'signup' && inviterName && (
            <p className="text-gray-700 text-sm font-semibold mb-1">
              고객님도 <span className="text-blue-600">{inviterName}</span>님의 옷장과 애정템이 궁금하시죠?
            </p>
          )}
          {view === 'signup' && !inviterName && (
            <p className="text-gray-700 text-sm font-semibold mb-1">
              애정템이 뭔지 정말 궁금한 3명의 지인만 초대할수있어요
            </p>
          )}
          <p className="text-gray-500 text-sm">
            {view === 'signup' ? '옷장의 아끼는 옷부터 애정하는 액자까지.' : view === 'forgot' ? '이메일로 재설정 링크를 보내드려요' : '옷장의 아끼는 옷부터 애정하는 액자까지, 초대로만 운영되는 서클'}
          </p>
        </div>

        {/* Invite code display for signup */}
        {view === 'signup' && inviteCode && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 px-4 py-3 rounded-xl mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-900">초대 코드</p>
                <p className="text-sm font-mono font-bold text-blue-700">{inviteCode}</p>
              </div>
              <span className="text-2xl">✨</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={view === 'signup' ? handleSignup : view === 'forgot' ? handleForgotPassword : handleLogin} className="space-y-3">
          {view === 'signup' && (
            <input
              type="text"
              placeholder="이름 (실명)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              maxLength={20}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-1000 focus:border-transparent bg-white"
            />
          )}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-1000 focus:border-transparent bg-white"
          />
          {view !== 'forgot' && (
            <input
              type="password"
              placeholder={view === 'signup' ? '비밀번호 (6자 이상)' : '비밀번호'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={view === 'signup' ? 6 : undefined}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-1000 focus:border-transparent bg-white"
            />
          )}
          
          {error && (
            <p className="text-red-500 text-sm px-1">{error}</p>
          )}
          
          {view === 'signup' && inviterName && (
            <p className="text-center text-sm text-gray-600 mb-2 -mt-1">
              가입하고 <span className="font-semibold text-gray-800">{inviterName}님</span>의 애정템을 확인해보세요!
            </p>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-slate-900 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-800/25"
          >
            {loading 
              ? (view === 'signup' ? '가입 중...' : view === 'forgot' ? '전송 중...' : '로그인 중...') 
              : (view === 'signup' ? '시작하기' : view === 'forgot' ? '비밀번호 재설정 링크 보내기' : '로그인')
            }
          </button>
          
          {view === 'login' && (
            <button
              type="button"
              onClick={() => { setError(null); setView('forgot') }}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2"
            >
              비밀번호를 잊으셨나요?
            </button>
          )}
          
          {view === 'forgot' && resetSent && (
            <p className="text-center text-sm text-green-600 mt-2">
              비밀번호 재설정 링크를 이메일로 보냈습니다. 📧
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-100">
        <div className="text-center animate-pulse">
          <CirqlLogo size="lg" />
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
