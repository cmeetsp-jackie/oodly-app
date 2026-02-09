import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Nav } from '@/components/nav'
import Link from 'next/link'
import { EditDisplayName } from '@/components/edit-display-name'
import { LogoutButton } from '@/components/logout-button'
import { AvatarUpload } from '@/components/avatar-upload'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get follower/following counts
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', user.id)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', user.id)

  // 우들리명 (display_name) 또는 username 사용
  const displayName = profile?.display_name || profile?.username

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pt-16 md:pb-4">
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 md:hidden">
        <h1 className="text-xl font-bold text-center">{displayName}</h1>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Profile header */}
        <div className="bg-white p-6">
          <div className="flex items-center gap-6">
            <AvatarUpload 
              currentAvatarUrl={profile?.avatar_url || null}
              displayName={displayName || ''}
              userId={user.id}
            />
            
            <div className="flex-1 space-y-2">
              {/* 이름 (실명) */}
              <div>
                <span className="text-sm text-gray-500">이름</span>
                <p className="text-lg font-medium text-gray-900">{profile?.username}</p>
              </div>
              
              {/* 우들리명 (편집 가능) */}
              <EditDisplayName 
                currentDisplayName={profile?.display_name || ''} 
                userId={user.id}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-around mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="font-semibold">{posts?.length || 0}</p>
              <p className="text-sm text-gray-500">게시물</p>
            </div>
            <Link href="/profile/followers" className="text-center hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
              <p className="font-semibold">{followersCount || 0}</p>
              <p className="text-sm text-gray-500">팔로워</p>
            </Link>
            <Link href="/profile/following" className="text-center hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
              <p className="font-semibold">{followingCount || 0}</p>
              <p className="text-sm text-gray-500">팔로잉</p>
            </Link>
          </div>

          {/* Logout */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
            <LogoutButton />
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
            <Link href="/upload" className="text-blue-600 hover:underline mt-2 block">
              첫 번째 사진 올리기
            </Link>
          </div>
        )}
      </main>

      <Nav user={user} />
    </div>
  )
}
