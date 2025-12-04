import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Fetch latest posts
    const postsQuery = `
      SELECT 
        'post' as type,
        p.id,
        COALESCE(u.username, p.author) as user_address,
        p.content as details,
        p.community_name,
        p.created_at
      FROM posts p
      LEFT JOIN users u ON LOWER(u.address) = LOWER(p.author)
    `;

    // Fetch latest trades
    const tradesQuery = `
      SELECT 
        'trade' as type,
        t.id,
        COALESCE(u.username, t.trader) as user_address,
        CONCAT(CASE WHEN t.is_buy THEN 'Bought ' ELSE 'Sold ' END, ROUND(t.shares::numeric / 1000, 2), ' shares') as details,
        t.community_name,
        t.created_at
      FROM trades t
      LEFT JOIN users u ON LOWER(u.address) = LOWER(t.trader)
    `;

    // Combine and sort
    const query = `
      (${postsQuery})
      UNION ALL
      (${tradesQuery})
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
