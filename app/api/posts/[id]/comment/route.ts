import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const postId = params.id;
        const result = await pool.query(
            'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC',
            [postId]
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await request.json();
        const { author, content } = body;
        const postId = params.id;

        if (!author || !content || !postId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await pool.query(
            'INSERT INTO comments (post_id, author, content) VALUES ($1, $2, $3) RETURNING *',
            [postId, author, content]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
