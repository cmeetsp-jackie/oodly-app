import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { PostCard } from '@/components/post-card'

// Revalidate every 10 seconds for faster page loads
export const revalidate = 10

export default async function FeedPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  // Temporarily disabled for testing
  // if (!user) redirect('/login')

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
        <h1 className="text-2xl font-black tracking-tight text-center bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
          Oodly
        </h1>
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
            <p className="mt-2 text-xs">Debug: posts={JSON.stringify(posts)}</p>
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
