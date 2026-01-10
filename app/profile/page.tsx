'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Trade } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  const [balance, setBalance] = useState<string>('0.00');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [balanceRes, tradesRes] = await Promise.all([
          api.getBalance(),
          api.getAllTrades(),
        ]);
        setBalance(balanceRes.message);
        setTrades(tradesRes.message);
      } catch (error) {
        if (error instanceof ApiError) {
          showToast(error.message, 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, router, showToast]);

  // Calculate stats
  const totalTrades = trades.length;
  const activeTrades = trades.filter((t) => !t.liquidated).length;
  const closedTrades = trades.filter((t) => t.liquidated).length;
  const totalPnL = trades.filter((t) => t.liquidated).reduce((sum, t) => sum + t.pnl, 0);
  const winningTrades = trades.filter((t) => t.liquidated && t.pnl > 0).length;
  const winRate = closedTrades > 0 ? ((winningTrades / closedTrades) * 100).toFixed(1) : '0';

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Your <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-zinc-400">Manage your account and view trading statistics</p>
        </div>

        {/* Profile Card */}
        <Card variant="gradient" className="mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                <p className="text-zinc-400">@{user?.username}</p>
              </div>

              {/* Balance */}
              <div className="text-right">
                <p className="text-sm text-zinc-400">Total Balance</p>
                <p className="text-3xl font-bold gradient-text">
                  ${isLoading ? '---' : parseFloat(balance).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
        </Card>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-zinc-400">Full Name</span>
                <span className="text-white font-medium">{user?.name || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-zinc-400">Username</span>
                <span className="text-white font-medium">@{user?.username || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-zinc-400">Email</span>
                <span className="text-white font-medium">{user?.email || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-zinc-400">Account Balance</span>
                <span className="text-emerald-400 font-medium">
                  ${isLoading ? '---' : parseFloat(balance).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trading Statistics</CardTitle>
              <CardDescription>Your performance overview</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-zinc-400">Total Trades</span>
                <span className="text-white font-medium">{isLoading ? '-' : totalTrades}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-zinc-400">Active Positions</span>
                <span className="text-cyan-400 font-medium">{isLoading ? '-' : activeTrades}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-zinc-400">Closed Trades</span>
                <span className="text-white font-medium">{isLoading ? '-' : closedTrades}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-zinc-400">Win Rate</span>
                <span className="text-white font-medium">{isLoading ? '-' : `${winRate}%`}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-zinc-400">Realized P&L</span>
                <span className={`font-medium ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isLoading ? '-' : `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString()}`}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="danger" onClick={logout} className="sm:w-auto">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
