import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Tweet } from '../types'
import TweetForm from './TweetForm'
import TweetItem from './TweetItem'

interface Props {
  userId: string
  username: string
  onLogout: () => void
}

export default function Feed({ userId, username, onLogout }: Props) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchTweets() {
    const { data } = await supabase
      .from('tweets')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) setTweets(data as unknown as Tweet[])
    setLoading(false)
  }

  async function deleteTweet(id: string) {
    await supabase.from('tweets').delete().eq('id', id)
    setTweets((prev) => prev.filter((t) => t.id !== id))
  }

  useEffect(() => {
    fetchTweets()

    const channel = supabase
      .channel('tweets-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tweets' }, () => {
        fetchTweets()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <header className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between z-10">
          <h1 className="text-white font-bold text-xl">𝕏</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">@{username}</span>
            <button
              onClick={onLogout}
              className="text-gray-400 text-sm hover:text-white transition border border-gray-700 rounded-full px-3 py-1"
            >
              ログアウト
            </button>
          </div>
        </header>

        {/* Tweet form */}
        <TweetForm userId={userId} />

        {/* Timeline */}
        {loading ? (
          <p className="text-gray-500 text-center py-10">読み込み中...</p>
        ) : tweets.length === 0 ? (
          <p className="text-gray-500 text-center py-10">まだ投稿がありません</p>
        ) : (
          tweets.map((tweet) => (
            <TweetItem
              key={tweet.id}
              tweet={tweet}
              currentUserId={userId}
              onDelete={deleteTweet}
            />
          ))
        )}
      </div>
    </div>
  )
}
