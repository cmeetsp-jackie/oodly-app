import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function FollowersPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get my followers
  const { data: followers } = await supabase
    .from('follows')
    .select(`
      follower_id,
      user:users!follows_follower_id_fkey(*)
    `)
    .eq('following_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pt-16 md:pb-4">
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 md:hidden">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">팔로워</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto bg-white min-h-screen">
        {followers && followers.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {followers.map((item) => {
              const followerUser = item.user as any
              const displayName = followerUser?.display_name || followerUser?.username
              
              return (
                <li key={item.follower_id}>
                  <Link 
                    href={`/profile/${item.follower_id}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={followerUser?.avatar_url || ''} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {displayName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{displayName}</p>
                      {followerUser?.bio && (
                        <p className="text-sm text-gray-500 line-clamp-1">{followerUser.bio}</p>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>아직 팔로워가 없습니다.</p>
          </div>
        )}
      </main>

      <Nav user={user} />
    </div>
  )
}
