import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ChatRoom } from '@/components/chat-room'

export default async function ChatPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get conversation with participants
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant1:users!conversations_participant1_id_fkey(*),
      participant2:users!conversations_participant2_id_fkey(*),
      post:posts(id, image_url, caption)
    `)
    .eq('id', id)
    .single()

  if (error || !conversation) {
    notFound()
  }

  // Check if user is participant
  if (conversation.participant1_id !== user.id && conversation.participant2_id !== user.id) {
    redirect('/chat')
  }

  // Get initial messages
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!messages_sender_id_fkey(*)
    `)
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })
    .limit(100)

  // Mark messages as read
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', id)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  // Get the other participant
  const otherUser = conversation.participant1_id === user.id 
    ? conversation.participant2 
    : conversation.participant1

  return (
    <ChatRoom 
      conversation={conversation}
      initialMessages={messages || []}
      currentUser={user}
      otherUser={otherUser}
    />
  )
}
