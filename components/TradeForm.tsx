'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { LEVERAGE_OPTIONS, type Asset } from '@/lib/types';

interface TradeFormProps {
  assets: Asset[];
  onTradeCreated?: () => void;
  compact?: boolean;
}

export function TradeForm({ assets, onTradeCreated, compact = false }: TradeFormProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    asset: 'BTC',
    type: 'long' as 'long' | 'short',
    leverage: '5',
    quantity: '',
    slippage: '1',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      showToast('Please enter a valid quantity', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await api.createTrade({
        asset: formData.asset as 'BTC' | 'ETH' | 'SOL',
        type: formData.type,
        leverage: parseInt(formData.leverage) as 1 | 2 | 5 | 10 | 25 | 100,
        quantity: parseFloat(formData.quantity),
        slippage: parseFloat(formData.slippage),
      });
      showToast('Trade placed successfully!', 'success');
      setFormData((prev) => ({ ...prev, quantity: '' }));
      onTradeCreated?.();
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, 'error');
      } else {
        showToast('Failed to place trade', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const assetOptions = assets.map((a) => ({
    value: a.symbol,
    label: `${a.symbol} - ${a.name}`,
  }));

  const leverageOptions = LEVERAGE_OPTIONS.map((l) => ({
    value: l.toString(),
    label: `${l}x`,
  }));

  return (
    <Card variant="glass" className={compact ? 'p-4' : 'p-6'}>
      <h3 className="text-lg font-semibold text-white mb-4">
        {compact ? 'Quick Trade' : 'Create Trade'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Asset"
          options={assetOptions}
          value={formData.asset}
          onChange={(value) => setFormData((prev) => ({ ...prev, asset: value }))}
        />

        {/* Long/Short Toggle */}
        <div>
          <label className="label">Position Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: 'long' }))}
              className={`py-3 rounded-lg font-medium transition-all ${
                formData.type === 'long'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20'
              }`}
            >
              Long ↑
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: 'short' }))}
              className={`py-3 rounded-lg font-medium transition-all ${
                formData.type === 'short'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20'
              }`}
            >
              Short ↓
            </button>
          </div>
        </div>

        <Select
          label="Leverage"
          options={leverageOptions}
          value={formData.leverage}
          onChange={(value) => setFormData((prev) => ({ ...prev, leverage: value }))}
        />

        <Input
          label="Quantity"
          type="number"
          placeholder="0.00"
          step="any"
          min="0"
          value={formData.quantity}
          onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
        />

        {!compact && (
          <Input
            label="Slippage (bips)"
            type="number"
            placeholder="1"
            min="0"
            value={formData.slippage}
            onChange={(e) => setFormData((prev) => ({ ...prev, slippage: e.target.value }))}
          />
        )}

        <Button
          type="submit"
          variant={formData.type === 'long' ? 'primary' : 'danger'}
          className="w-full"
          isLoading={isLoading}
        >
          {formData.type === 'long' ? 'Open Long Position' : 'Open Short Position'}
        </Button>
      </form>
    </Card>
  );
}
