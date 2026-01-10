'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { TradeForm } from '@/components/TradeForm';
import { TradeCard } from '@/components/TradeCard';
import { LiquidateModal } from '@/components/LiquidateModal';
import type { Trade, Asset } from '@/lib/types';

export default function TradePage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [balance, setBalance] = useState<string>('0.00');
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [balanceRes, tradesRes, assetsRes] = await Promise.all([
        api.getBalance(),
        api.getActiveTrades(),
        api.getSupportedAssets(),
      ]);
      setBalance(balanceRes.message);
      setActiveTrades(tradesRes.message);
      setAssets(assetsRes.assets);
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, router, fetchData]);

  const handleTradeCreated = () => {
    fetchData();
  };

  const handleLiquidate = (trade: Trade) => {
    setSelectedTrade(trade);
  };

  const handleLiquidated = () => {
    fetchData();
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="gradient-text">Trading</span> Interface
          </h1>
          <p className="text-zinc-400">
            Open long or short positions with up to 100x leverage
          </p>
        </div>

        {/* Balance Bar */}
        <Card variant="glass" className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-400">Available Balance</p>
              <p className="text-2xl font-bold text-white">
                ${isLoading ? '---' : parseFloat(balance).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-zinc-400">Active Positions</p>
                <p className="text-xl font-bold text-white">{activeTrades.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-zinc-400">Assets Available</p>
                <p className="text-xl font-bold text-cyan-400">{assets.length}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trade Form */}
          <div>
            {assets.length > 0 ? (
              <TradeForm assets={assets} onTradeCreated={handleTradeCreated} />
            ) : (
              <Card className="animate-pulse">
                <div className="h-96 skeleton rounded-xl" />
              </Card>
            )}

            {/* Asset Info Cards */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              {assets.map((asset) => (
                <Card key={asset.symbol} variant="glass" padding="sm" className="text-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold">{asset.symbol}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{asset.name}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Active Trades Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Active Positions</CardTitle>
                <CardDescription>Your open trades that can be liquidated</CardDescription>
              </CardHeader>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 skeleton rounded-xl" />
                  ))}
                </div>
              ) : activeTrades.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-emerald-500/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <p className="text-zinc-400 mb-2">No active positions</p>
                  <p className="text-sm text-zinc-500">
                    Use the form to open your first trade
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {activeTrades.map((trade) => (
                    <TradeCard
                      key={trade.id}
                      trade={trade}
                      onLiquidate={handleLiquidate}
                      showLiquidateButton
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Leverage Info */}
        <Card variant="glass" className="mt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">Leverage Trading Risk</p>
              <p className="text-sm text-zinc-400">
                Trading with leverage increases both potential profits and losses. Higher leverage means higher risk.
                Start with lower leverage (1x-5x) if you&apos;re new to trading. Never trade more than you can afford to lose.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Liquidate Modal */}
      {selectedTrade && (
        <LiquidateModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onLiquidated={handleLiquidated}
        />
      )}
    </div>
  );
}
