import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const communityName = searchParams.get('communityName');

    if (!communityName) {
        return NextResponse.json({ error: 'Community name is required' }, { status: 400 });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM trades WHERE community_name = $1 ORDER BY created_at ASC',
            [communityName]
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching trades:', error);
        return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { communityName, trader, isBuy, shares, ethAmount, txHash, usdPrice, sttAmount } = body;

        if (!communityName || !trader || isBuy === undefined || !shares || !ethAmount || !txHash) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await pool.query(
            'INSERT INTO trades (community_name, trader, is_buy, shares, eth_amount, tx_hash, usd_price, stt_amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [communityName, trader, isBuy, shares, ethAmount, txHash, usdPrice || 0, sttAmount || ethAmount]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error recording trade:', error);
        return NextResponse.json({ error: 'Failed to record trade' }, { status: 500 });
    }
}
