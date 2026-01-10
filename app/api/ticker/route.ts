import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        const url = new URL('https://api.backpack.exchange/api/v1/ticker');
        url.searchParams.set('symbol', symbol);

        const response = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch ticker from Backpack Exchange' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching ticker:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
