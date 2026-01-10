'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Trade, ASSET_MAP } from '@/lib/types';

interface LiquidateModalProps {
  trade: Trade;
  onClose: () => void;
  onLiquidated: () => void;
}

export function LiquidateModal({ trade, onClose, onLiquidated }: LiquidateModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(trade.quantity.toString());

  const assetSymbol = ASSET_MAP[trade.assetId] || 'Unknown';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sellQuantity = parseFloat(quantity);
    if (isNaN(sellQuantity) || sellQuantity <= 0) {
      showToast('Please enter a valid quantity', 'warning');
      return;
    }

    if (sellQuantity > trade.quantity) {
      showToast('Quantity exceeds available amount', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.liquidateTrade({
        id: trade.id,
        quantity: sellQuantity,
      });
      showToast('Trade liquidated successfully!', 'success');
      onLiquidated();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, 'error');
      } else {
        showToast('Failed to liquidate trade', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <Card variant="glass" className="w-full max-w-md m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Liquidate Position</h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Trade Summary */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-zinc-400">Asset</span>
            <span className="text-white font-medium">{assetSymbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Position Type</span>
            <span className={trade.type === 'long' ? 'text-emerald-400' : 'text-red-400'}>
              {trade.type.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Entry Price</span>
            <span className="text-white">${trade.assetPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Leverage</span>
            <span className="text-cyan-400">{trade.leverage}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Available Quantity</span>
            <span className="text-white font-medium">{trade.quantity.toFixed(4)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Quantity to Sell"
            type="number"
            placeholder="0.00"
            step="any"
            min="0"
            max={trade.quantity}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setQuantity((trade.quantity / 4).toFixed(4))}
            >
              25%
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setQuantity((trade.quantity / 2).toFixed(4))}
            >
              50%
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setQuantity((trade.quantity * 0.75).toFixed(4))}
            >
              75%
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(trade.quantity.toFixed(4))}
            >
              Max
            </Button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="flex-1"
              isLoading={isLoading}
            >
              Liquidate
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
