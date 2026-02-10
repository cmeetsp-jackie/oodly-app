'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImagePlus, X } from 'lucide-react'
import { Nav } from '@/components/nav'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [story, setStory] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    // Check if adding these files would exceed 10 total
    if (files.length + selectedFiles.length > 10) {
      setError('최대 10장까지 업로드할 수 있습니다.')
      return
    }

    // Validate each file
    const validFiles: File[] = []
    const newPreviews: string[] = []

    for (const file of selectedFiles) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.')
        continue
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('각 파일 크기는 5MB 이하여야 합니다.')
        continue
      }

      validFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    }

    setFiles(prev => [...prev, ...validFiles])
    setPreviews(prev => [...prev, ...newPreviews])
    setError(null)
  }

  const handleRemoveImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index)
      // Revoke URL to prevent memory leak
      URL.revokeObjectURL(prev[index])
      return newPreviews
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('최소 1장의 이미지를 선택해주세요.')
      return
    }
    
    if (!story.trim()) {
      setError('#특별한이유#히스토리를 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Upload all images to Supabase Storage
      const uploadedUrls: string[] = []
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          setError(`Storage 에러: ${uploadError.message}`)
          setLoading(false)
          return
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      // Create post with images array
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: uploadedUrls[0], // Keep for backward compatibility
          images: uploadedUrls,
          caption: caption.trim() || null,
          story: story.trim(),
          price: price ? parseInt(price.replace(/,/g, '')) : null,
        })

      if (postError) {
        console.error('Post insert error:', postError)
        setError(`Post 에러: ${postError.message}`)
        setLoading(false)
        return
      }

      router.push('/feed')
      router.refresh()
    } catch (err) {
      console.error('Upload error:', err)
      setError('업로드에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pt-16 md:pb-4">
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 flex items-center justify-between md:hidden">
        <button onClick={() => router.back()} className="text-gray-600">
          취소
        </button>
        <h1 className="font-semibold text-gray-900">새 게시물</h1>
        <Button 
          onClick={handleUpload} 
          disabled={files.length === 0 || !story.trim() || loading}
          size="sm"
        >
          {loading ? '업로드 중...' : '공유'}
        </Button>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {/* Image upload area */}
        <div className="mb-4">
          {previews.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/50 rounded text-white text-xs">
                      {index + 1}
                    </div>
                  </div>
                ))}
                {previews.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <ImagePlus size={24} />
                    <span className="text-xs mt-1">추가</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 text-center">
                {previews.length}/10 장
              </p>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
            >
              <ImagePlus size={48} />
              <span>사진 선택 (최대 10장)</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
          <div className="relative">
            <input
              type="text"
              placeholder="0"
              value={price}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '')
                setPrice(val ? Number(val).toLocaleString() : '')
              }}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
          </div>
        </div>

        {/* Caption */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
          <Textarea
            placeholder="상품에 대한 설명을 입력해주세요..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            maxLength={150}
            className="text-gray-900 bg-white border-gray-300"
          />
          <p className="text-right text-xs text-gray-400 mt-1">
            {caption.length}/150
          </p>
        </div>

        {/* Story - Required */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            #특별한이유#히스토리 <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="이 물건과 함께한 나만의 추억이나 스토리를 들려주세요..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={4}
            maxLength={150}
            className="text-gray-900 bg-white border-gray-300"
            required
          />
          <p className="text-right text-xs text-gray-400 mt-1">
            {story.length}/150
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Desktop upload button */}
        <div className="hidden md:block">
          <Button 
            onClick={handleUpload} 
            disabled={files.length === 0 || !story.trim() || loading}
            className="w-full"
          >
            {loading ? '업로드 중...' : '공유하기'}
          </Button>
        </div>
      </main>

      <Nav user={{ id: '', email: '' }} />
    </div>
  )
}
