export interface Log {
    id: number
    level: string
    module: string
    action: string
    message: string
    timestamp: string
    path?: string
    user_id?: number
    username?: string
    error?: any
    metadata?: any
  }
  