export type Profile = {
  id: string
  username: string
  created_at: string
}

export type TweetRow = {
  id: string
  user_id: string
  content: string
  created_at: string
}

export type Tweet = TweetRow & {
  profiles: { username: string } | null
}
