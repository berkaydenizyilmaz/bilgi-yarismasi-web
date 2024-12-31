export interface LeaderboardEntry {
    username: string
    total_score: number
    total_play_count: number
    leaderboard: {
      rank: number
    }
  }