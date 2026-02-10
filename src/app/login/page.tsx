'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CirqlLogo } from '@/components/cirql-logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = createClient()

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

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-100">
        <div className="text-center animate-pulse">
          <CirqlLogo size="lg" />
        </div>
      </div>
    )
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

    // Clear invite code from localStorage
    localStorage.removeItem('cirql_invite_code')

    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col p-4 pt-12 bg-gradient-to-br from-gray-50 via-white to-slate-100">
      <div className="max-w-md w-full mx-auto text-center space-y-5">
        {/* Logo */}
        <div className="space-y-2">
          <div className="flex justify-center">
            <CirqlLogo size="lg" />
          </div>
          <p className="text-gray-500 text-xs">옷장의 아끼는 옷부터 애정하는 액자까지.</p>
          <p className="text-gray-600 text-sm font-medium">초대로만 운영되는 서클</p>
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

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3 mt-6">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-1000 focus:border-transparent bg-white"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-1000 focus:border-transparent bg-white"
          />
          
          {error && (
            <p className="text-red-500 text-sm px-1">{error}</p>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-slate-900 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-800/25"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-xs text-gray-400 font-medium tracking-wider uppercase mt-6">
          Where favorites find new homes
        </p>
      </div>
    </div>
  )
}
