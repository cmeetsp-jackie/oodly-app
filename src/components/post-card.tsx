'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, MessageSquareMore, Zap, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from '@/lib/utils'
import type { Post, Comment } from '@/types/database'

interface PostCardProps {
  post: Post
  currentUserId: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [postingComment, setPostingComment] = useState(false)
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const supabase = createClient()
  const router = useRouter()
  
  const isOwnPost = post.user_id === currentUserId

  const handleLike = async () => {
    if (isLiking || !currentUserId) return
    setIsLiking(true)

    if (isLiked) {
      setIsLiked(false)
      setLikesCount(prev => prev - 1)
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', currentUserId)
        .eq('post_id', post.id)
    } else {
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
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${currentUserId},participant2_id.eq.${post.user.id}),and(participant1_id.eq.${post.user.id},participant2_id.eq.${currentUserId})`)
        .single()

      if (existing) {
        router.push(`/chat/${existing.id}`)
      } else {
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
    }

    setIsStartingChat(false)
  }

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true)
      const { data } = await supabase
        .from('comments')
        .select(`*, user:users!comments_user_id_fkey(*)`)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })
        .limit(20)
      
      setComments(data || [])
      setLoadingComments(false)
    }
    setShowComments(!showComments)
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || postingComment || !currentUserId) return

    setPostingComment(true)
    const content = newComment.trim()
    setNewComment('')

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        user_id: currentUserId,
        content
      })
      .select(`*, user:users!comments_user_id_fkey(*)`)
      .single()

    if (!error && data) {
      setComments(prev => [...prev, data])
      setCommentsCount(prev => prev + 1)
    }

    setPostingComment(false)
  }

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
                ? 'bg-rose-100 text-rose-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            disabled={isLiking}
          >
            <Heart 
              size={18} 
              className={isLiked ? 'fill-rose-500' : ''} 
            />
            {likesCount > 0 && <span className="text-sm font-semibold">{likesCount}</span>}
          </button>
          
          <button 
            onClick={handleToggleComments}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              showComments 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MessageSquareMore size={18} />
            {commentsCount > 0 && (
              <span className="text-sm font-semibold">{commentsCount}</span>
            )}
          </button>
          
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
          <p className="mt-2 text-sm text-gray-800">
            <span className="font-bold text-gray-900">{displayName}</span>{' '}
            {post.caption}
          </p>
        )}

        {/* Time */}
        <p className="mt-1 text-xs text-gray-400">
          {formatDistanceToNow(post.created_at)}
        </p>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {loadingComments ? (
              <p className="text-sm text-gray-400">댓글 로딩중...</p>
            ) : (
              <>
                {/* Comments List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-400">첫 댓글을 남겨보세요!</p>
                  ) : (
                    comments.map((comment) => {
                      const commentDisplayName = comment.user?.display_name || comment.user?.username
                      return (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarImage src={comment.user?.avatar_url || ''} />
                            <AvatarFallback className="text-xs bg-gray-200">
                              {commentDisplayName?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-semibold text-gray-900">{commentDisplayName}</span>{' '}
                              <span className="text-gray-700">{comment.content}</span>
                            </p>
                            <p className="text-xs text-gray-400">{formatDistanceToNow(comment.created_at)}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Comment Input */}
                {currentUserId && (
                  <form onSubmit={handlePostComment} className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글 달기..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || postingComment}
                      className="p-2 text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      <Send size={20} />
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
