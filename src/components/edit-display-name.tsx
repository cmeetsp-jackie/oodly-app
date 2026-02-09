'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EditDisplayNameProps {
  currentDisplayName: string
  userId: string
}

export function EditDisplayName({ currentDisplayName, userId }: EditDisplayNameProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(currentDisplayName)
  const [savedDisplayName, setSavedDisplayName] = useState(currentDisplayName)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    if (!displayName.trim()) return
    
    setSaving(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('users')
      .update({ display_name: displayName.trim() })
      .eq('id', userId)

    if (!error) {
      setSavedDisplayName(displayName.trim())
      setIsEditing(false)
      // Refresh in background for server sync
      router.refresh()
    } else {
      console.error('Error updating display name:', error)
      alert('써클명 저장에 실패했습니다.')
    }
    setSaving(false)
  }

  const handleCancel = () => {
    setDisplayName(currentDisplayName)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div>
        <span className="text-sm text-gray-500">써클명</span>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm"
            placeholder="써클명을 입력하세요"
            autoFocus
          />
          <button 
            onClick={handleSave}
            disabled={saving}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <Check className="h-5 w-5" />
          </button>
          <button 
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:bg-gray-50 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <span className="text-sm text-gray-500">써클명</span>
      <div className="flex items-center gap-2">
        <p className="text-lg font-medium text-gray-900">
          {savedDisplayName || <span className="text-gray-400">설정하기</span>}
        </p>
        <button 
          onClick={() => setIsEditing(true)}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
