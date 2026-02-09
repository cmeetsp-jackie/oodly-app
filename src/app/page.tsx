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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white">
      <div className="max-w-md w-full text-center space-y-10">
        {/* Logo */}
        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            Oodly
          </h1>
          <p className="text-gray-400 text-lg font-light">셀럽들의 옷장을 엿보다</p>
        </div>

        {/* Features */}
        <div className="space-y-5 text-left">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
            <span className="text-3xl">✨</span>
            <div>
              <h3 className="font-bold text-white text-lg">옷장 자랑</h3>
              <p className="text-sm text-gray-400">내 옷장의 힙한 아이템들을 플렉스</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
            <span className="text-3xl">🔥</span>
            <div>
              <h3 className="font-bold text-white text-lg">찜하기</h3>
              <p className="text-sm text-gray-400">갖고싶은 아이템 바로 찜</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
            <span className="text-3xl">💫</span>
            <div>
              <h3 className="font-bold text-white text-lg">팔로우</h3>
              <p className="text-sm text-gray-400">패션 센스 통하는 사람들 팔로우</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-4">
          <Link href="/signup" className="block">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 text-lg rounded-xl border-0" size="lg">
              시작하기
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 py-6 text-lg rounded-xl" size="lg">
              로그인
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500 font-medium tracking-wider uppercase">
          Instagram for your closet
        </p>
      </div>
    </div>
  )
}
