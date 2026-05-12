export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          created_at?: string
        }
        Update: {
          username?: string
        }
      }
      tweets: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
          profiles: {
            username: string
          } | null
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Tweet = Database['public']['Tables']['tweets']['Row']
