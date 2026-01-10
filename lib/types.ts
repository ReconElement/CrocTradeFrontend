// Request Types
export interface SignupRequest {
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    password: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface CreateTradeRequest {
    asset: 'BTC' | 'ETH' | 'SOL';
    type: 'long' | 'short';
    leverage: 1 | 2 | 5 | 10 | 25 | 100;
    quantity: number;
    slippage: number;
}

export interface LiquidateRequest {
    id: string;
    quantity: number;
}

// Response Types
export interface Profile {
    email: string;
    name: string;
    username: string;
    fund: number;
}

export interface Trade {
    id: string;
    openPrice: number;
    closePrice: number;
    leverage: number;
    pnl: number;
    assetId: number;
    liquidated: boolean;
    userId: string;
    assetPrice: number;
    quantity: number;
    type: 'long' | 'short';
}

export interface Asset {
    symbol: string;
    name: string;
    imageUrl: string;
}

export interface SupportedAssetsResponse {
    assets: Asset[];
}

export interface ProfileResponse {
    profile: Profile;
}

export interface TradesResponse {
    message: Trade[];
}

export interface BalanceResponse {
    message: string;
}

export interface MessageResponse {
    message: string;
}

// Asset ID mapping
export const ASSET_MAP: Record<number, string> = {
    1: 'BTC',
    2: 'ETH',
    3: 'SOL',
};

export const ASSET_NAMES: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    SOL: 'Solana',
};

export const LEVERAGE_OPTIONS = [1, 2, 5, 10, 25, 100] as const;
export type LeverageOption = typeof LEVERAGE_OPTIONS[number];
