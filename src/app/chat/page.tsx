import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { formatDistanceToNow } from '@/lib/utils'

export const revalidate = 0  // Always fetch fresh data

export default async function ChatListPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      participant1:users!conversations_participant1_id_fkey(*),
      participant2:users!conversations_participant2_id_fkey(*),
      post:posts(id, image_url)
    `)
    .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  // Get last message and unread count for each conversation
  const conversationsWithDetails = await Promise.all(
    (conversations || []).map(async (conv) => {
      // Get last message
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', user.id)
        .eq('is_read', false)

      // Get the other participant
      const otherUser = conv.participant1_id === user.id 
        ? conv.participant2 
        : conv.participant1

      return {
        ...conv,
        other_user: otherUser,
        last_message: lastMessage,
        unread_count: unreadCount || 0
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pt-16 md:pb-4">
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 md:hidden">
        <h1 className="text-xl font-bold text-center">채팅</h1>
      </header>

      <main className="max-w-lg mx-auto bg-white min-h-screen">
        {conversationsWithDetails.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {conversationsWithDetails.map((conv) => {
              const displayName = conv.other_user?.display_name || conv.other_user?.username
              
              return (
                <li key={conv.id}>
                  <Link 
                    href={`/chat/${conv.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={conv.other_user?.avatar_url || ''} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                          {displayName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold text-gray-900 ${conv.unread_count > 0 ? 'text-black' : ''}`}>
                          {displayName}
                        </p>
                        {conv.last_message && (
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {conv.last_message.sender_id === user.id ? '나: ' : ''}
                          {conv.last_message.content}
                        </p>
                      )}
                    </div>

                    {/* Post thumbnail if exists */}
                    {conv.post?.image_url && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={conv.post.image_url} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>아직 채팅이 없습니다.</p>
            <p className="mt-2 text-sm">피드에서 마음에 드는 상품의 채팅 버튼을 눌러보세요!</p>
          </div>
        )}
      </main>

      <Nav user={user} />
    </div>
  )
}
