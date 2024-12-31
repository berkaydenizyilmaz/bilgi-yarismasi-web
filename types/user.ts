export interface User {
    id: number
    username: string
    email: string
    role: 'user' | 'admin'
    created_at: string
  }
  
  export interface UserStats {
    total_score: number
    total_play_count: number
    average_score: number
    best_category: string
    worst_category: string
  }