'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from '@/lib/utils'
import type { Message, User, Conversation } from '@/types/database'

interface ChatRoomProps {
  conversation: Conversation
  initialMessages: Message[]
  currentUser: { id: string }
  otherUser: User | null
}

export function ChatRoom({ 
  conversation, 
  initialMessages, 
  currentUser, 
  otherUser 
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const displayName = otherUser?.display_name || otherUser?.username

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        async (payload) => {
          const newMsg = payload.new as Message
          
          // Fetch sender info
          const { data: sender } = await supabase
            .from('users')
            .select('*')
            .eq('id', newMsg.sender_id)
            .single()

          setMessages(prev => [...prev, { ...newMsg, sender }])

          // Mark as read if not from current user
          if (newMsg.sender_id !== currentUser.id) {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id, currentUser.id, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    try {
      // Insert message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUser.id,
          content
        })

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id)

    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(content) // Restore message on error
    }

    setSending(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link href="/chat" className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <Link href={`/profile/${otherUser?.id}`} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser?.avatar_url || ''} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {displayName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-gray-900">{displayName}</span>
          </Link>
        </div>
      </header>

      {/* Post reference if exists */}
      {conversation.post && (
        <div className="bg-white border-b border-gray-100 p-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={(conversation.post as any).image_url} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-gray-500">
              이 상품에 대한 대화
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-lg mx-auto space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              {displayName}님에게 첫 메시지를 보내보세요!
            </p>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === currentUser.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                      {formatDistanceToNow(message.created_at)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="max-w-lg mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지 입력..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
