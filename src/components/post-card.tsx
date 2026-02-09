'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, MessageSquare, Zap } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from '@/lib/utils'
import type { Post } from '@/types/database'

interface PostCardProps {
  post: Post
  currentUserId: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  
  const isOwnPost = post.user_id === currentUserId

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)

    if (isLiked) {
      // Unlike
      setIsLiked(false)
      setLikesCount(prev => prev - 1)
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', currentUserId)
        .eq('post_id', post.id)
    } else {
      // Like
      setIsLiked(true)
      setLikesCount(prev => prev + 1)
      await supabase
        .from('likes')
        .insert({ user_id: currentUserId, post_id: post.id })
    }

    setIsLiking(false)
  }

  const handleStartChat = async () => {
    if (isStartingChat || !post.user?.id) return
    setIsStartingChat(true)

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${currentUserId},participant2_id.eq.${post.user.id}),and(participant1_id.eq.${post.user.id},participant2_id.eq.${currentUserId})`)
        .single()

      if (existing) {
        router.push(`/chat/${existing.id}`)
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            participant1_id: currentUserId,
            participant2_id: post.user.id,
            post_id: post.id
          })
          .select('id')
          .single()

        if (error) throw error
        router.push(`/chat/${newConv.id}`)
      }
    } catch (error) {
      console.error('Error starting chat:', error)
      alert('채팅을 시작할 수 없습니다.')
    }

    setIsStartingChat(false)
  }

  // 우들리명 (display_name) 또는 username 사용
  const displayName = post.user?.display_name || post.user?.username

  return (
    <article className="bg-white">
      {/* Header */}
      <div className="flex items-center p-3">
        <Link href={`/profile/${post.user?.id}`} className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-blue-100">
            <AvatarImage src={post.user?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">{displayName?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-bold text-gray-900">{displayName}</span>
        </Link>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={post.image_url}
          alt={post.caption || 'Post image'}
          fill
          className="object-cover"
          sizes="(max-width: 512px) 100vw, 512px"
        />
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95 ${
              isLiked 
                ? 'bg-amber-100 text-amber-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            disabled={isLiking}
          >
            <Star 
              size={18} 
              className={isLiked ? 'fill-amber-500' : ''} 
            />
            {likesCount > 0 && <span className="text-sm font-semibold">{likesCount}</span>}
          </button>
          
          <Link 
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            <MessageSquare size={18} />
            {(post.comments_count || 0) > 0 && (
              <span className="text-sm font-semibold">{post.comments_count}</span>
            )}
          </Link>
          
          {/* Chat button - only show on others' posts */}
          {!isOwnPost && currentUserId && (
            <button
              onClick={handleStartChat}
              disabled={isStartingChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all active:scale-95 disabled:opacity-50 ml-auto"
            >
              <Zap size={18} className="fill-white" />
              <span className="text-sm font-semibold">채팅</span>
            </button>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="mt-1 text-sm text-gray-800">
            <span className="font-bold text-gray-900">{displayName}</span>{' '}
            {post.caption}
          </p>
        )}

        {/* Time */}
        <p className="mt-1 text-xs text-gray-400">
          {formatDistanceToNow(post.created_at)}
        </p>
      </div>
    </article>
  )
}
