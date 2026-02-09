'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface FollowButtonProps {
  targetUserId: string
  currentUserId: string
  initialIsFollowing: boolean
}

export function FollowButton({ 
  targetUserId, 
  currentUserId, 
  initialIsFollowing 
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFollow = async () => {
    if (isLoading) return
    setIsLoading(true)

    if (isFollowing) {
      // Unfollow
      setIsFollowing(false)
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)

      if (error) {
        console.error('Unfollow error:', error)
        setIsFollowing(true) // Revert on error
      }
    } else {
      // Follow
      setIsFollowing(true)
      const { error } = await supabase
        .from('follows')
        .insert({ 
          follower_id: currentUserId, 
          following_id: targetUserId 
        })

      if (error) {
        console.error('Follow error:', error)
        setIsFollowing(false) // Revert on error
      }
    }

    setIsLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
        isFollowing
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } disabled:opacity-50`}
    >
      {isLoading ? '...' : isFollowing ? '팔로잉' : '팔로우'}
    </button>
  )
}
