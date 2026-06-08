import { useEffect, useState } from 'react'
import { onAuth } from '../firebase/auth'
import type { User } from 'firebase/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuth(u => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  return { user, loading }
}
