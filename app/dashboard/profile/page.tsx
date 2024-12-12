'use client';

import { useProfile } from '@/lib/hooks/useProfile';
import { QuizHistory, useQuizHistory } from '@/lib/hooks/useQuizHistory';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { quizHistory, isLoading: historyLoading, error: historyError } = useQuizHistory();

  if (profileLoading || historyLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (profileError || historyError || !profile) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{profileError || historyError || 'Profil bilgileri alınamadı'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Profil Bilgileri</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Kullanıcı Adı</p>
              <p className="font-medium">{profile?.username}</p> {/* Optional chaining kullanıldı */}
            </div>
            <div>
              <p className="text-gray-600">E-posta</p>
              <p className="font-medium">{profile?.email}</p> {/* Optional chaining kullanıldı */}
            </div>
            <div>
              <p className="text-gray-600">Toplam Quiz</p>
              <p className="font-medium">{profile?.total_play_count}</p> {/* Optional chaining kullanıldı */}
            </div>
            <div>
              <p className="text-gray-600">Toplam Puan</p>
              <p className="font-medium">{profile?.total_score}</p> {/* Optional chaining kullanıldı */}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Quiz Geçmişi</h2>
          <div className="space-y-4">
            {quizHistory.length > 0 ? (
              quizHistory.map((quiz) => (
                <QuizHistoryItem key={quiz.id} quiz={quiz} />
              ))
            ) : (
              <p className="text-center text-gray-600">Hiç quiz geçmişi bulunamadı.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuizHistoryItem({ quiz }: { quiz: QuizHistory }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{quiz.category.name}</h3>
          <p className="text-sm text-gray-600">
            {formatDate(new Date(quiz.played_at))}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-orange-600">%{quiz.score}</p>
          <p className="text-sm text-gray-600">
            {quiz.correct_answers}/{quiz.total_questions} doğru
          </p>
        </div>
      </div>
    </div>
  );
}