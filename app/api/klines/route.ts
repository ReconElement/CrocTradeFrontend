import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '1m';
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        const url = new URL('https://api.backpack.exchange/api/v1/klines');
        url.searchParams.set('symbol', symbol);
        url.searchParams.set('interval', interval);
        if (startTime) url.searchParams.set('startTime', startTime);
        if (endTime) url.searchParams.set('endTime', endTime);

        const response = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch klines from Backpack Exchange' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching klines:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
