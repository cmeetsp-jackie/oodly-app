'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusSquare, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavProps {
  user: { id: string; email: string } | null
}

export function Nav({ user }: NavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

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
            pathname === '/profile' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User size={24} />
        </Link>

        <button 
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
        >
          <LogOut size={24} />
        </button>
      </div>
    </nav>
  )
}
