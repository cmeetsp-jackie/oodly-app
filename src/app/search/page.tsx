'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, ArrowLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Nav } from '@/components/nav'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    // Search users
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10)

    // Search posts by caption
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, user:users!posts_user_id_fkey(*)')
      .or(`caption.ilike.%${query}%,story.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    setUsers(usersData || [])
    setPosts(postsData || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="p-1">
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="유저 또는 상품 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            검색
          </button>
        </form>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {loading && (
          <p className="text-center text-gray-500 py-8">검색 중...</p>
        )}

        {searched && !loading && users.length === 0 && posts.length === 0 && (
          <p className="text-center text-gray-500 py-8">검색 결과가 없습니다.</p>
        )}

        {/* Users */}
        {users.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">유저</h2>
            <div className="space-y-2">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {(user.display_name || user.username)?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{user.display_name || user.username}</p>
                    <p className="text-sm text-gray-500">{user.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        {posts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3">상품</h2>
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
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
                  {post.price && (
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      {post.price.toLocaleString()}원
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Nav user={{ id: '', email: '' }} />
    </div>
  )
}
