'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import type { Asset } from '@/lib/types';

export default function LandingPage() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await api.getSupportedAssets();
        setAssets(response.assets);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      }
    };
    fetchAssets();
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial" />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-zinc-400">Now supporting leverage up to 100x</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Trade Crypto with
              <br />
              <span className="gradient-text">Maximum Precision</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Experience the future of cryptocurrency trading. Advanced charting, 
              instant execution, and powerful leverage options—all in one platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link href="/signup">
                <Button variant="primary" size="lg">
                  Start Trading Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Login to Account
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text">$5K</p>
                <p className="text-sm text-zinc-400 mt-1">Starting Balance</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text">100x</p>
                <p className="text-sm text-zinc-400 mt-1">Max Leverage</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text">3+</p>
                <p className="text-sm text-zinc-400 mt-1">Crypto Assets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1s' }} />
      </section>

      {/* Features Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">CrocTrade</span>?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Built for traders who demand speed, security, and powerful tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card variant="glass" hoverable className="group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Lightning Fast</h3>
              <p className="text-zinc-400">
                Execute trades in milliseconds with our optimized trading engine.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card variant="glass" hoverable className="group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Secure & Safe</h3>
              <p className="text-zinc-400">
                Bank-grade security with encrypted connections and secure authentication.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card variant="glass" hoverable className="group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Advanced Tools</h3>
              <p className="text-zinc-400">
                Leverage up to 100x with real-time PnL tracking and position management.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Supported Assets Section */}
      <section className="relative py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Supported <span className="gradient-text">Assets</span>
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Trade the most popular cryptocurrencies with competitive spreads.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {assets.length > 0 ? (
              assets.map((asset) => (
                <Card key={asset.symbol} variant="glass" hoverable className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold gradient-text">{asset.symbol.charAt(0)}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{asset.symbol}</h3>
                  <p className="text-zinc-400 text-sm">{asset.name}</p>
                </Card>
              ))
            ) : (
              <>
                <Card variant="glass" className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-amber-400">₿</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">BTC</h3>
                  <p className="text-zinc-400 text-sm">Bitcoin</p>
                </Card>
                <Card variant="glass" className="text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-indigo-400">Ξ</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">ETH</h3>
                  <p className="text-zinc-400 text-sm">Ethereum</p>
                </Card>
                <Card variant="glass" className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-400">◎</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">SOL</h3>
                  <p className="text-zinc-400 text-sm">Solana</p>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <Card variant="gradient" className="max-w-4xl mx-auto text-center p-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Ready to Start Trading?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Join CrocTrade today and get $5,000 in virtual funds to start trading instantly.
              </p>
              <Link href="/signup">
                <Button variant="primary" size="lg">
                  Create Free Account
                </Button>
              </Link>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10" />
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">CT</span>
              </div>
              <span className="text-sm text-zinc-400">© 2026 CrocTrade. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-400">
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
