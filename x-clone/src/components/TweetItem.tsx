import type { Tweet } from '../types'

interface Props {
  tweet: Tweet
  currentUserId: string
  onDelete: (id: string) => void
}

export default function TweetItem({ tweet, currentUserId, onDelete }: Props) {
  const date = new Date(tweet.created_at).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="border-b border-gray-800 px-4 py-3 hover:bg-gray-950 transition">
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold shrink-0">
            {(tweet.profiles?.username ?? '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm truncate">
                {tweet.profiles?.username ?? '不明'}
              </span>
              <span className="text-gray-500 text-xs shrink-0">{date}</span>
            </div>
            <p className="text-white mt-1 break-words whitespace-pre-wrap">{tweet.content}</p>
          </div>
        </div>
        {tweet.user_id === currentUserId && (
          <button
            onClick={() => onDelete(tweet.id)}
            className="text-gray-600 hover:text-red-500 text-xs shrink-0 transition"
            title="削除"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
