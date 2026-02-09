import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yliczwrnmiwewbcythdn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaWN6d3JubWl3ZXdiY3l0aGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDcwMzQsImV4cCI6MjA4NjE4MzAzNH0.UpFzgmHp00vqe_6URDW0DPRbwFECUSHt6xgPI8CVrCk'
)

const { data: posts, error } = await supabase
  .from('posts')
  .select(`
    *,
    user:users!posts_user_id_fkey(*),
    likes(count),
    comments(count)
  `)
  .order('created_at', { ascending: false })
  .limit(50)

console.log('Posts:', JSON.stringify(posts, null, 2))
console.log('Error:', error)
