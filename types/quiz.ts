export interface Question {
    id: number
    questionText: string
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    correctOption: 'A' | 'B' | 'C' | 'D'
    categoryId: number
  }
  
  export interface QuizResult {
    id: number
    score: number
    correctAnswers: number
    totalQuestions: number
    categoryName: string
    playedAt: string
    user_interactions: QuizInteraction[]
  }
  
  export interface QuizInteraction {
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
  }

  export interface QuizHistory {
    id: number
    categoryName: string
    playedAt: string
    score: number
    correctAnswers: number
    totalQuestions: number
  }