'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  displayName: string
  userId: string
}

export function AvatarUpload({ currentAvatarUrl, displayName, userId }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('5MB 이하의 이미지만 업로드 가능합니다.')
      return
    }

    setUploading(true)

    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      router.refresh()
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('프로필 사진 업로드에 실패했습니다.')
    }

    setUploading(false)
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={uploading}
        className="relative group"
      >
        <Avatar className="h-20 w-20 ring-2 ring-gray-200">
          <AvatarImage src={avatarUrl || ''} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
            {displayName?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay */}
        <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-all ${
          uploading 
            ? 'bg-black/50' 
            : 'bg-black/0 group-hover:bg-black/40'
        }`}>
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
