'use client';

import { createContext, useContext } from 'react';
import type { AuctionApi } from './useAuction';

export const AuctionContext = createContext<AuctionApi | null>(null);

export function useAuctionContext(): AuctionApi {
  const ctx = useContext(AuctionContext);
  if (!ctx) {
    throw new Error('useAuctionContext must be used inside <AuctionContext.Provider>');
  }
  return ctx;
}
