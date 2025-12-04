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

        // Create somi_prices table for caching daily prices
        await client.query(`
      CREATE TABLE IF NOT EXISTS somi_prices (
        id SERIAL PRIMARY KEY,
        price_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
        usd_price DECIMAL(20, 8) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Created somi_prices table');

        // Create index for faster lookups
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_somi_prices_date ON somi_prices(price_date);
    `);
        console.log('Created index on price_date');

    } catch (err) {
        console.error('Error setting up database:', err);
    } finally {
        await client.end();
    }
}

setup();
