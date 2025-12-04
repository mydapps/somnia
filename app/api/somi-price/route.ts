import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        // Check if we have today's price cached
        const cached = await pool.query(
            'SELECT usd_price FROM somi_prices WHERE price_date = $1',
            [today]
        );

        if (cached.rows.length > 0) {
            // Return cached price
            return NextResponse.json({
                usd_price: parseFloat(cached.rows[0].usd_price),
                cached: true,
                date: today
            });
        }

        // Fetch fresh price from CoinGecko
        // Note: CoinGecko doesn't have a direct SOMI listing, so we'll use a placeholder
        // You should replace 'ethereum' with the actual SOMI token ID when available
        let usdPrice = 0.01; // Default fallback price

        try {
            // Try to fetch from CoinGecko API
            // Replace 'ethereum' with actual SOMI token ID when available on CoinGecko
            const response = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=somnia-network&vs_currencies=usd',
                { next: { revalidate: 86400 } } // Cache for 24 hours
            );

            if (response.ok) {
                const data = await response.json();
                if (data['somnia-network']?.usd) {
                    usdPrice = data['somnia-network'].usd;
                }
            }
        } catch (err) {
            console.error('Failed to fetch from CoinGecko:', err);
            // Use fallback price
        }

        // Store in database
        await pool.query(
            'INSERT INTO somi_prices (price_date, usd_price) VALUES ($1, $2) ON CONFLICT (price_date) DO UPDATE SET usd_price = $2',
            [today, usdPrice]
        );

        return NextResponse.json({
            usd_price: usdPrice,
            cached: false,
            date: today
        });

    } catch (error) {
        console.error('Error fetching SOMI price:', error);
        return NextResponse.json({
            usd_price: 0.01, // Fallback price
            error: 'Failed to fetch price',
            cached: false
        }, { status: 500 });
    }
}
