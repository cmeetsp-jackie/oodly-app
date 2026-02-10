'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SignupRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const invite = searchParams.get('invite')
    if (invite) {
      router.replace(`/?invite=${invite}`)
    } else {
      router.replace('/')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-600">리다이렉트 중...</p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    }>
      <SignupRedirect />
    </Suspense>
  )
}
