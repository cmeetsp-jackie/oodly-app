export interface User {
  id: string
  email: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  image_url: string
  caption: string | null
  created_at: string
  // Joined fields
  user?: User
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface Like {
  user_id: string
  post_id: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  // Joined fields
  user?: User
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at'>
        Update: Partial<Omit<Post, 'id' | 'user_id' | 'created_at'>>
      }
      follows: {
        Row: Follow
        Insert: Omit<Follow, 'created_at'>
        Update: never
      }
      likes: {
        Row: Like
        Insert: Omit<Like, 'created_at'>
        Update: never
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at'>
        Update: Partial<Omit<Comment, 'id' | 'user_id' | 'post_id' | 'created_at'>>
      }
    }
  }
}
