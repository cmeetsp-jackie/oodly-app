import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import { Nav } from '@/components/nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { FollowButton } from '@/components/follow-button'

export default async function UserProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // 본인 프로필이면 /profile로 리다이렉트
  if (currentUser?.id === id) {
    redirect('/profile')
  }

  // Get target user profile
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Get user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  // Get follower/following counts
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', id)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', id)

  // Check if current user is following this user
  let isFollowing = false
  if (currentUser) {
    const { data: followData } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', currentUser.id)
      .eq('following_id', id)
      .single()
    
    isFollowing = !!followData
  }

  // 써클명 (display_name) 또는 username 사용
  const displayName = profile.display_name || profile.username

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pt-16 md:pb-4">
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 md:hidden">
        <h1 className="text-xl font-bold text-center text-gray-900">{displayName}</h1>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Profile header */}
        <div className="bg-white p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                {displayName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{displayName}</h2>
              {profile.bio && (
                <p className="text-gray-600 mt-1">{profile.bio}</p>
              )}
              
              {/* Follow button */}
              {currentUser && (
                <div className="mt-3">
                  <FollowButton 
                    targetUserId={id}
                    currentUserId={currentUser.id}
                    initialIsFollowing={isFollowing}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-around mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="font-semibold">{posts?.length || 0}</p>
              <p className="text-sm text-gray-500">게시물</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{followersCount || 0}</p>
              <p className="text-sm text-gray-500">팔로워</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{followingCount || 0}</p>
              <p className="text-sm text-gray-500">팔로잉</p>
            </div>
          </div>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {posts?.map((post) => (
            <Link 
              key={post.id} 
              href={`/post/${post.id}`}
              className="relative aspect-square bg-gray-100"
            >
              <Image
                src={post.image_url}
                alt={post.caption || 'Post'}
                fill
                className="object-cover"
                sizes="(max-width: 512px) 33vw, 170px"
              />
            </Link>
          ))}
        </div>

        {(!posts || posts.length === 0) && (
          <div className="p-8 text-center text-gray-500 bg-white mt-0.5">
            <p>아직 게시물이 없습니다.</p>
          </div>
        )}
      </main>

      <Nav user={currentUser} />
    </div>
  )
}
