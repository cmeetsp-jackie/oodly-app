import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function FollowingPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get users I'm following
  const { data: following } = await supabase
    .from('follows')
    .select(`
      following_id,
      user:users!follows_following_id_fkey(*)
    `)
    .eq('follower_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pt-16 md:pb-4">
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 md:hidden">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold">팔로잉</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto bg-white min-h-screen">
        {following && following.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {following.map((item) => {
              const followedUser = item.user as any
              const displayName = followedUser?.display_name || followedUser?.username
              
              return (
                <li key={item.following_id}>
                  <Link 
                    href={`/profile/${item.following_id}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={followedUser?.avatar_url || ''} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {displayName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{displayName}</p>
                      {followedUser?.bio && (
                        <p className="text-sm text-gray-500 line-clamp-1">{followedUser.bio}</p>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>아직 팔로우한 사람이 없습니다.</p>
            <Link href="/feed" className="text-blue-600 hover:underline mt-2 block">
              피드에서 찾아보기
            </Link>
          </div>
        )}
      </main>

      <Nav user={user} />
    </div>
  )
}
