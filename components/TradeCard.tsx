import React from 'react';
import { Trade, ASSET_MAP } from '@/lib/types';
import { Card } from '@/components/ui/Card';

interface TradeCardProps {
  trade: Trade;
  currentPrice?: number;
  onLiquidate?: (trade: Trade) => void;
  showLiquidateButton?: boolean;
}

export function TradeCard({ trade, currentPrice, onLiquidate, showLiquidateButton = true }: TradeCardProps) {
  const assetSymbol = ASSET_MAP[trade.assetId] || 'Unknown';
  
  // Calculate unrealized PnL for active trades
  const calculatePnL = () => {
    if (trade.liquidated) {
      return trade.pnl;
    }
    if (!currentPrice) return 0;
    
    const priceDiff = trade.type === 'long' 
      ? currentPrice - trade.assetPrice 
      : trade.assetPrice - currentPrice;
    
    return priceDiff * trade.quantity * trade.leverage;
  };

  const pnl = calculatePnL();
  const pnlPercentage = trade.openPrice > 0 ? (pnl / trade.openPrice) * 100 : 0;
  const isProfit = pnl >= 0;

  return (
    <Card className="relative overflow-hidden">
      {/* Type Indicator */}
      <div
        className={`absolute top-0 left-0 w-1 h-full ${
          trade.type === 'long' ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Asset & Type */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-sm font-bold">{assetSymbol}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{assetSymbol}</span>
                <span
                  className={`badge ${
                    trade.type === 'long' ? 'badge-success' : 'badge-danger'
                  }`}
                >
                  {trade.type.toUpperCase()}
                </span>
                <span className="badge badge-info">{trade.leverage}x</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {trade.liquidated ? 'Liquidated' : 'Active'}
              </p>
            </div>
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-400">Entry Price</p>
              <p className="font-medium text-white">${trade.assetPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-zinc-400">Quantity</p>
              <p className="font-medium text-white">{trade.quantity.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-zinc-400">Position Value</p>
              <p className="font-medium text-white">${trade.openPrice.toLocaleString()}</p>
            </div>
            {trade.liquidated && (
              <div>
                <p className="text-zinc-400">Close Price</p>
                <p className="font-medium text-white">${trade.closePrice.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* PnL Display */}
        <div className="text-right">
          <p className="text-xs text-zinc-400 mb-1">PnL</p>
          <p className={`text-xl font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
            {isProfit ? '+' : ''}{pnl.toFixed(2)}
          </p>
          <p className={`text-xs ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{pnlPercentage.toFixed(2)}%
          </p>
          
          {showLiquidateButton && !trade.liquidated && onLiquidate && (
            <button
              onClick={() => onLiquidate(trade)}
              className="mt-3 px-4 py-2 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Liquidate
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
