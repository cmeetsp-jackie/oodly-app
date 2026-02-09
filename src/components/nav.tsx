'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusSquare, User, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NavProps {
  user: { id: string; email?: string } | null
}

export function Nav({ user }: NavProps) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    // Fetch initial unread count
    const fetchUnread = async () => {
      // Get conversations where user is participant
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)

      if (!conversations?.length) return

      const conversationIds = conversations.map(c => c.id)

      // Count unread messages not sent by user
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .eq('is_read', false)

      setUnreadCount(count || 0)
    }

    fetchUnread()

    // Subscribe to new messages
    const channel = supabase
      .channel('nav-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchUnread()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => fetchUnread()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        <Link 
          href="/feed" 
          className={`p-2 rounded-lg transition-colors ${
            pathname === '/feed' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home size={24} />
        </Link>
        
        <Link 
          href="/upload" 
          className={`p-2 rounded-lg transition-colors ${
            pathname === '/upload' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <PlusSquare size={24} />
        </Link>
        
        <Link 
          href="/profile" 
          className={`p-2 rounded-lg transition-colors ${
            pathname === '/profile' || pathname.startsWith('/profile/') ? 'text-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User size={24} />
        </Link>

        <Link 
          href="/chat"
          className={`p-2 rounded-lg transition-colors relative ${
            pathname === '/chat' || pathname.startsWith('/chat/') ? 'text-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}
