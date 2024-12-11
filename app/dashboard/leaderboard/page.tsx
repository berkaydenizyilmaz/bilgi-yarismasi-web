'use client';

import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function LeaderboardPage() {
  const { leaderboard, isLoading, error } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          QuizVerse Lider Tablosu
        </h1>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sıra</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kullanıcı</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Toplam Puan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quiz Sayısı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.map((entry) => (
                <tr key={entry.username} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {entry.leaderboard.rank}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {entry.username}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {entry.total_score}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {entry.total_play_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}