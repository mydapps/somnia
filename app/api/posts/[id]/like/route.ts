import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await request.json();
        const { userAddress } = body;
        const postId = params.id;

        if (!userAddress || !postId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if already liked
        const existing = await pool.query(
            'SELECT * FROM likes WHERE post_id = $1 AND user_address = $2',
            [postId, userAddress]
        );

        if (existing.rows.length > 0) {
            // Unlike
            await pool.query(
                'DELETE FROM likes WHERE post_id = $1 AND user_address = $2',
                [postId, userAddress]
            );
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await pool.query(
                'INSERT INTO likes (post_id, user_address) VALUES ($1, $2)',
                [postId, userAddress]
            );
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const postId = params.id;
        const result = await pool.query('SELECT COUNT(*) FROM likes WHERE post_id = $1', [postId]);
        return NextResponse.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error fetching likes:', error);
        return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
    }
}
