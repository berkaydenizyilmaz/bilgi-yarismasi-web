'use client';

import { SWRConfig } from 'swr';
import { swrConfig, fetcher } from '@/lib/swr-config';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig 
      value={{
        ...swrConfig,
        fetcher
      }}
    >
      {children}
    </SWRConfig>
  );
} 