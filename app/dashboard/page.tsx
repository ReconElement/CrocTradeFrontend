'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TradeForm } from '@/components/TradeForm';
import { TradeCard } from '@/components/TradeCard';
import { LiquidateModal } from '@/components/LiquidateModal';
import type { Trade, Asset } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
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

  // Calculate portfolio stats
  const totalPositionValue = activeTrades.reduce((sum, t) => sum + t.openPrice, 0);
  const longPositions = activeTrades.filter((t) => t.type === 'long').length;
  const shortPositions = activeTrades.filter((t) => t.type === 'short').length;

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
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-zinc-400">Here&apos;s an overview of your trading portfolio</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Balance Card */}
          <Card variant="gradient" className="relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-sm text-zinc-400 mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-white">
                ${isLoading ? '---' : parseFloat(balance).toLocaleString()}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          </Card>

          {/* Position Value */}
          <Card>
            <p className="text-sm text-zinc-400 mb-1">Total Position Value</p>
            <p className="text-2xl font-bold text-white">
              ${isLoading ? '---' : totalPositionValue.toLocaleString()}
            </p>
          </Card>

          {/* Long Positions */}
          <Card>
            <p className="text-sm text-zinc-400 mb-1">Long Positions</p>
            <p className="text-2xl font-bold text-emerald-400">
              {isLoading ? '-' : longPositions}
            </p>
          </Card>

          {/* Short Positions */}
          <Card>
            <p className="text-sm text-zinc-400 mb-1">Short Positions</p>
            <p className="text-2xl font-bold text-red-400">
              {isLoading ? '-' : shortPositions}
            </p>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Trades - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Trades</CardTitle>
                    <CardDescription>Your open positions</CardDescription>
                  </div>
                  <Link href="/history">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 skeleton rounded-xl" />
                  ))}
                </div>
              ) : activeTrades.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-zinc-400 mb-4">No active trades</p>
                  <Link href="/trade">
                    <Button variant="primary" size="sm">
                      Start Trading
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
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

          {/* Quick Trade Form - Takes 1 column */}
          <div>
            {assets.length > 0 && (
              <TradeForm
                assets={assets}
                onTradeCreated={handleTradeCreated}
                compact
              />
            )}

            {/* Quick Links */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                <Link href="/trade" className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Full Trading Interface
                  </Button>
                </Link>
                <Link href="/history" className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Trade History
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Profile
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
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
