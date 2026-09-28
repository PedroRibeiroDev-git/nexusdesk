import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../lib/api'
import type { User } from '../types'

interface LoginResponse {
  token: string
  expiresInSeconds: number
  user: User
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('nexusdesk_token')
    setUser(null)
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      if (!localStorage.getItem('nexusdesk_token')) {
        setLoading(false)
        return
      }

      try {
        setUser(await api<User>('/auth/me'))
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [logout])

  useEffect(() => {
    const onUnauthorized = () => logout()
    window.addEventListener('nexusdesk:unauthorized', onUnauthorized)
    return () => window.removeEventListener('nexusdesk:unauthorized', onUnauthorized)
  }, [logout])

  const login = async (email: string, password: string) => {
    const result = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('nexusdesk_token', result.token)
    setUser(result.user)
  }

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth precisa estar dentro de AuthProvider')
  }
  return context
}
