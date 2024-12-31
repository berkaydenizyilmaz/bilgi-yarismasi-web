export interface StatCardProps {
    icon?: React.ReactNode
    title: string
    value: string | number
    description?: string
    className?: string
  }
  
  export interface DetailStatProps {
    title: string
    value: number | string
  }
  
  export interface QuizHistoryItemProps {
    quiz: {
      id: number
      categoryName: string
      playedAt: string
      score: number
      correctAnswers: number
      totalQuestions: number
    }
  }