import { useState } from 'react'
import { supabase } from '../lib/supabase'

const MAX_LENGTH = 280

interface Props {
  userId: string
}

export default function TweetForm({ userId }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || loading) return
    setLoading(true)
    await supabase.from('tweets').insert({ user_id: userId, content: content.trim() })
    setContent('')
    setLoading(false)
  }

  const remaining = MAX_LENGTH - content.length

  return (
    <form onSubmit={handleSubmit} className="border-b border-gray-800 p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
        placeholder="いまどうしてる？"
        rows={3}
        className="w-full bg-transparent text-white placeholder-gray-500 text-lg resize-none focus:outline-none"
      />
      <div className="flex items-center justify-between mt-2">
        <span className={`text-sm ${remaining < 20 ? 'text-red-500' : 'text-gray-500'}`}>
          {remaining}
        </span>
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="bg-blue-500 text-white font-bold px-5 py-2 rounded-full hover:bg-blue-600 transition disabled:opacity-40"
        >
          投稿
        </button>
      </div>
    </form>
  )
}
