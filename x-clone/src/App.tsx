import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './components/AuthPage'
import Feed from './components/Feed'

export default function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [initializing, setInitializing] = useState(true)

  async function loadProfile(uid: string) {
    const { data } = await supabase.from('profiles').select('username').eq('id', uid).single()
    if (data) setUsername(data.username)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        loadProfile(session.user.id)
      }
      setInitializing(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        loadProfile(session.user.id)
      } else {
        setUserId(null)
        setUsername('')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="text-white text-2xl">𝕏</span>
      </div>
    )
  }

  if (!userId) return <AuthPage />

  return <Feed userId={userId} username={username} onLogout={handleLogout} />
}
