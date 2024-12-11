import { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,  // Sekme aktif olduğunda yeniden doğrula
  revalidateOnReconnect: true,  // İnternet bağlantısı geri geldiğinde yeniden doğrula
  refreshInterval: 0,  // Otomatik yenileme kapalı (endpoint'e göre değişecek)
  shouldRetryOnError: true,  // Hata durumunda tekrar dene
  errorRetryCount: 3,  // Maksimum hata deneme sayısı
  dedupingInterval: 2000,  // Aynı isteği tekrarlama aralığı (ms)
};

// Global fetcher fonksiyonu
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Bir hata oluştu');
  }
  return res.json();
}; 