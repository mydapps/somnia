import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const result = await pool.query(
            `SELECT c.*, COALESCE(u.username, c.owner) as owner_display 
       FROM communities c 
       LEFT JOIN users u ON LOWER(u.address) = LOWER(c.owner) 
       ORDER BY c.created_at DESC`
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching communities:', error);
        return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, owner, txHash } = body;

        if (!name || !owner || !txHash) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await pool.query(
            'INSERT INTO communities (name, owner, tx_hash) VALUES ($1, $2, $3) RETURNING *',
            [name, owner, txHash]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating community:', error);
        return NextResponse.json({ error: 'Failed to create community' }, { status: 500 });
    }
}
