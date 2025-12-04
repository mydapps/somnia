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
            `SELECT p.*, COALESCE(u.username, p.author) as author_display 
       FROM posts p 
       LEFT JOIN users u ON LOWER(u.address) = LOWER(p.author) 
       WHERE p.community_name = $1 
       ORDER BY p.created_at DESC`,
            [communityName]
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { communityName, author, content, imageUrl } = body;

        if (!communityName || !author || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await pool.query(
            'INSERT INTO posts (community_name, author, content, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [communityName, author, content, imageUrl]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
