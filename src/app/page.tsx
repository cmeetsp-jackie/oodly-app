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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Closette</h1>
          <p className="text-gray-600">나만의 옷장을 공유하세요</p>
        </div>

        {/* Features */}
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👗</span>
            <div>
              <h3 className="font-semibold">옷장 자랑</h3>
              <p className="text-sm text-gray-500">내 옷장의 아이템들을 사진으로 공유해요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">❤️</span>
            <div>
              <h3 className="font-semibold">찜하기</h3>
              <p className="text-sm text-gray-500">마음에 드는 아이템을 찜해두세요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <h3 className="font-semibold">팔로우</h3>
              <p className="text-sm text-gray-500">패션 감각이 통하는 사람들을 팔로우하세요</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link href="/signup" className="block">
            <Button className="w-full" size="lg">
              시작하기
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full" size="lg">
              로그인
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Instagram for your closet
        </p>
      </div>
    </div>
  )
}
