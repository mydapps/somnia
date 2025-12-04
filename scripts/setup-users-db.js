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

        // Create users table
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        address TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Created users table');

    } catch (err) {
        console.error('Error setting up database:', err);
    } finally {
        await client.end();
    }
}

setup();
