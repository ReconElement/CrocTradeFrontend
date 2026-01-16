import type {
    SignupRequest,
    LoginRequest,
    CreateTradeRequest,
    LiquidateRequest,
    ProfileResponse,
    TradesResponse,
    BalanceResponse,
    MessageResponse,
    SupportedAssetsResponse,
} from './types';

const API_BASE = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1`;

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
        throw new ApiError(response.status, data.message || 'An error occurred');
    }
    return data;
}

export const api = {
    async signup(data: SignupRequest): Promise<MessageResponse> {
        const res = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        return handleResponse<MessageResponse>(res);
    },

    async login(data: LoginRequest): Promise<MessageResponse> {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        return handleResponse<MessageResponse>(res);
    },

    async getProfile(): Promise<ProfileResponse> {
        const res = await fetch(`${API_BASE}/profile`, {
            credentials: 'include',
        });
        return handleResponse<ProfileResponse>(res);
    },

    async getBalance(): Promise<BalanceResponse> {
        const res = await fetch(`${API_BASE}/balance`, {
            credentials: 'include',
        });
        return handleResponse<BalanceResponse>(res);
    },

    async getActiveTrades(): Promise<TradesResponse> {
        const res = await fetch(`${API_BASE}/trade/active-trades`, {
            credentials: 'include',
        });
        return handleResponse<TradesResponse>(res);
    },

    async getAllTrades(): Promise<TradesResponse> {
        const res = await fetch(`${API_BASE}/trade/trades`, {
            credentials: 'include',
        });
        return handleResponse<TradesResponse>(res);
    },

    async createTrade(data: CreateTradeRequest): Promise<MessageResponse> {
        const res = await fetch(`${API_BASE}/trade/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        return handleResponse<MessageResponse>(res);
    },

    async liquidateTrade(data: LiquidateRequest): Promise<MessageResponse> {
        const res = await fetch(`${API_BASE}/trade/liquidate-asset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        return handleResponse<MessageResponse>(res);
    },

    async getSupportedAssets(): Promise<SupportedAssetsResponse> {
        const res = await fetch(`${API_BASE}/supportedAssets`);
        return handleResponse<SupportedAssetsResponse>(res);
    },

    async healthCheck(): Promise<MessageResponse> {
        const res = await fetch('http://localhost:4000');
        return handleResponse<MessageResponse>(res);
    },
};

export { ApiError };
