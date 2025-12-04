const { Client } = require('pg');

const connectionString = 'postgresql://postgres.ahismgszdbygxtcrynci:' + encodeURIComponent('Mj+j8fxA?X%PsKU') + '@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function setup() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Update trades table
        await client.query(`
      ALTER TABLE trades 
      ADD COLUMN IF NOT EXISTS usd_price NUMERIC,
      ADD COLUMN IF NOT EXISTS stt_amount NUMERIC;
    `);
        console.log('Updated trades table');

        // Create comments table
        await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id),
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Created comments table');

        // Create likes table
        await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id),
        user_address TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_id, user_address)
      );
    `);
        console.log('Created likes table');

    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        await client.end();
    }
}

setup();
