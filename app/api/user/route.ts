import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        const result = await pool.query(
            'SELECT username FROM users WHERE address = $1',
            [address.toLowerCase()]
        );

        if (result.rows.length > 0) {
            return NextResponse.json({ username: result.rows[0].username });
        } else {
            return NextResponse.json({ username: null });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address, username } = body;

        if (!address || !username) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validation: Alphanumeric with spaces
        if (!/^[a-zA-Z0-9 ]+$/.test(username)) {
            return NextResponse.json({ error: 'Username must be alphanumeric' }, { status: 400 });
        }

        const result = await pool.query(
            'INSERT INTO users (address, username) VALUES ($1, $2) RETURNING *',
            [address.toLowerCase(), username]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        if ((error as any).code === '23505') { // Unique violation
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
