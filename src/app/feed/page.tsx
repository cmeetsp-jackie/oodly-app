import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Nav } from '@/components/nav'
import { PostCard } from '@/components/post-card'
import { CirqlLogo } from '@/components/cirql-logo'

// Revalidate every 10 seconds for faster page loads
export const revalidate = 10

export default async function FeedPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  // Temporarily disabled for testing
  // if (!user) redirect('/login')

  // Check if user has posted at least once
  let userPostCount = 0
  let displayName = ''
  if (user) {
    const { data: userPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', user.id)
    
    userPostCount = userPosts?.length || 0

    // Get user's display name
    const { data: userData } = await supabase
      .from('users')
      .select('display_name, username')
      .eq('id', user.id)
      .single()
    
    displayName = userData?.display_name || userData?.username || '회원'
  }

  // Show onboarding if user hasn't posted yet
  if (user && userPostCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 z-10">
          <div className="flex justify-center">
            <CirqlLogo size="md" />
          </div>
        </header>
        
        <div className="flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="text-6xl mb-6 animate-bounce">✨</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                환영합니다, {displayName}님!
              </h1>
              <div className="space-y-3">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  다른 사람들의 애정템이<br />궁금하신가요?
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  피드에는 초대받은 사람들의<br />
                  특별한 애정템과 옷장이 가득해요 💎
                </p>
                <div className="my-6 py-4 px-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <p className="text-gray-800 font-medium">
                    하지만 먼저,<br />
                    <span className="text-blue-600 font-bold">당신의 애정템을 하나 공유해주세요</span>
                  </p>
                </div>
              </div>
            </div>

            <Link href="/upload">
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl text-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                첫 애정템 올리고 피드 보기 →
              </button>
            </Link>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>💡</span>
              <span>옷, 가방, 신발, 소품, 무엇이든 좋아요</span>
            </div>
          </div>
        </div>

        <Nav user={user} />
      </div>
    )
  }

  // Get posts with user info and counts
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users!posts_user_id_fkey(*),
      likes(count),
      comments(count)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  console.log('Posts query result:', { posts, error })

  // Get user's liked posts
  const { data: userLikes } = user ? await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', user.id) : { data: null }

  const likedPostIds = new Set(userLikes?.map(l => l.post_id) || [])

  const postsWithLikeStatus = posts?.map(post => ({
    ...post,
    likes_count: post.likes?.[0]?.count || 0,
    comments_count: post.comments?.[0]?.count || 0,
    is_liked: likedPostIds.has(post.id),
  })) || []

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pt-16 md:pb-4">
      <header className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10 md:hidden">
        <div className="flex justify-center">
          <CirqlLogo size="md" />
        </div>
      </header>
      
      <main className="max-w-lg mx-auto">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 text-sm">
            Error: {error.message}
          </div>
        )}
        {postsWithLikeStatus.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>아직 포스트가 없습니다.</p>
            <p className="mt-2">첫 번째 옷장 사진을 올려보세요!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {postsWithLikeStatus.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user?.id || ''} />
            ))}
          </div>
        )}
      </main>

      <Nav user={user} />
    </div>
  )
}
// force redeploy Mon Feb  9 15:09:24 KST 2026
