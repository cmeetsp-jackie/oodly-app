'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Trash2, Save } from 'lucide-react'
import { Nav } from '@/components/nav'

export default function PostEditPage() {
  const [post, setPost] = useState<any>(null)
  const [caption, setCaption] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const postId = params.id as string

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)

      const { data: postData } = await supabase
        .from('posts')
        .select('*, user:users!posts_user_id_fkey(*)')
        .eq('id', postId)
        .single()

      if (postData) {
        setPost(postData)
        setCaption(postData.caption || '')
        setPrice(postData.price ? postData.price.toLocaleString() : '')
        setIsOwner(postData.user_id === user.id)
      }
      setLoading(false)
    }
    loadData()
  }, [postId, router, supabase])

  const handleSave = async () => {
    if (!isOwner || saving) return
    setSaving(true)

    await supabase
      .from('posts')
      .update({ 
        caption,
        price: price ? parseInt(price.replace(/,/g, '')) : null
      })
      .eq('id', postId)

    setSaving(false)
    router.push('/profile')
  }

  const handleDelete = async () => {
    if (!isOwner || deleting) return
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    setDeleting(true)

    try {
      // Delete from storage (best-effort, don't block on failure)
      if (post?.image_url) {
        try {
          const urlParts = post.image_url.split('/')
          const path = urlParts[urlParts.length - 1]
          
          if (path && user?.id) {
            const { error: storageError } = await supabase.storage
              .from('posts')
              .remove([`${user.id}/${path}`])
            
            if (storageError) {
              console.warn('Storage deletion failed (non-critical):', storageError)
            }
          }
        } catch (storageErr) {
          console.warn('Storage deletion error (non-critical):', storageErr)
        }
      }

      // Delete post (critical operation)
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (deleteError) {
        throw deleteError
      }

      // Success - navigate to profile
      router.push('/profile')
    } catch (error) {
      console.error('Post deletion failed:', error)
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">포스트를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {isOwner ? '포스트 수정' : '포스트'}
        </h1>
        <div className="w-6" />
      </header>

      <main className="max-w-lg mx-auto">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={post.image_url}
            alt={post.caption || 'Post'}
            fill
            className="object-cover"
          />
        </div>

        {/* Edit form (only for owner) */}
        {isOwner ? (
          <div className="p-4 bg-white space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가격
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={price}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    setPrice(val ? Number(val).toLocaleString() : '')
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">원</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                캡션
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="캡션을 입력하세요..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white">
            <p className="text-gray-900">{post.caption}</p>
          </div>
        )}
      </main>

      <Nav user={user} />
    </div>
  )
}
