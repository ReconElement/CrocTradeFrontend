'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TradeCard } from '@/components/TradeCard';
import { LiquidateModal } from '@/components/LiquidateModal';
import type { Trade } from '@/lib/types';

type FilterType = 'all' | 'active' | 'liquidated';

export default function HistoryPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const fetchTrades = useCallback(async () => {
    try {
      const response = await api.getAllTrades();
      setTrades(response.message);
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
      fetchTrades();
    }
  }, [authLoading, isAuthenticated, router, fetchTrades]);

  const handleLiquidate = (trade: Trade) => {
    setSelectedTrade(trade);
  };

  const handleLiquidated = () => {
    fetchTrades();
  };

  // Filter trades
  const filteredTrades = trades.filter((trade) => {
    if (filter === 'active') return !trade.liquidated;
    if (filter === 'liquidated') return trade.liquidated;
    return true;
  });

  // Calculate stats
  const totalTrades = trades.length;
  const activeTrades = trades.filter((t) => !t.liquidated).length;
  const liquidatedTrades = trades.filter((t) => t.liquidated).length;
  const totalPnL = trades.filter((t) => t.liquidated).reduce((sum, t) => sum + t.pnl, 0);

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
            Trade <span className="gradient-text">History</span>
          </h1>
          <p className="text-zinc-400">
            View all your past and active trades
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <p className="text-sm text-zinc-400 mb-1">Total Trades</p>
            <p className="text-2xl font-bold text-white">
              {isLoading ? '-' : totalTrades}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-zinc-400 mb-1">Active</p>
            <p className="text-2xl font-bold text-cyan-400">
              {isLoading ? '-' : activeTrades}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-zinc-400 mb-1">Closed</p>
            <p className="text-2xl font-bold text-zinc-400">
              {isLoading ? '-' : liquidatedTrades}
            </p>
          </Card>
          <Card variant="gradient">
            <p className="text-sm text-zinc-400 mb-1">Realized PnL</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {isLoading ? '-' : `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString()}`}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-zinc-400 mr-2">Filter:</span>
          {(['all', 'active', 'liquidated'] as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && ` (${totalTrades})`}
              {f === 'active' && ` (${activeTrades})`}
              {f === 'liquidated' && ` (${liquidatedTrades})`}
            </Button>
          ))}
        </div>

        {/* Trades List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === 'all' && 'All Trades'}
              {filter === 'active' && 'Active Trades'}
              {filter === 'liquidated' && 'Closed Trades'}
            </CardTitle>
            <CardDescription>
              {filteredTrades.length} trade{filteredTrades.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-28 skeleton rounded-xl" />
              ))}
            </div>
          ) : filteredTrades.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-zinc-400 mb-2">No trades found</p>
              <p className="text-sm text-zinc-500">
                {filter !== 'all'
                  ? 'Try changing the filter or start trading'
                  : 'Start trading to see your history here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  onLiquidate={handleLiquidate}
                  showLiquidateButton={!trade.liquidated}
                />
              ))}
            </div>
          )}
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
