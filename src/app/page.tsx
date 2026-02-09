import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to feed
  if (user) {
    redirect('/feed')
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo */}
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            Oodly
          </h1>
          <p className="text-gray-600 text-base font-medium">지인과 셀럽의 애정템을 사고파는 곳</p>
        </div>

        {/* Features */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
            <span className="text-2xl">💎</span>
            <div>
              <h3 className="font-bold text-gray-900">애정템 공유</h3>
              <p className="text-xs text-gray-500">내 애정템을 자랑하고 판매해요</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
            <span className="text-2xl">💬</span>
            <div>
              <h3 className="font-bold text-gray-900">찜하고 소통하고 득템까지</h3>
              <p className="text-xs text-gray-500">마음에 드는 아이템 찜하고 소통하고 득템까지!</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
            <span className="text-2xl">✨</span>
            <div>
              <h3 className="font-bold text-gray-900">팔로우</h3>
              <p className="text-xs text-gray-500">취향 맞는 셀러를 팔로우하세요</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 pt-2">
          <Link href="/signup" className="block">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-5 text-base rounded-xl border-0 shadow-lg shadow-purple-500/25" size="lg">
              시작하기
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-5 text-base rounded-xl font-semibold" size="lg">
              로그인
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">
          Where favorites find new homes
        </p>
      </div>
    </div>
  )
}
