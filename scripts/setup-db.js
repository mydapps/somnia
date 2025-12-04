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
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');

    // Create communities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS communities (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        owner TEXT NOT NULL,
        tx_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        community_type INT DEFAULT 1
      );
    `);
    console.log('Created communities table');

    // Create trades table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        community_name TEXT REFERENCES communities(name),
        trader TEXT NOT NULL,
        is_buy BOOLEAN NOT NULL,
        shares NUMERIC NOT NULL,
        eth_amount NUMERIC NOT NULL,
        tx_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Created trades table');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await client.end();
  }
}

setup();
