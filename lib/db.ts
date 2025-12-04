import { Pool } from 'pg';

const connectionString = 'postgresql://postgres.ahismgszdbygxtcrynci:' + encodeURIComponent('Mj+j8fxA?X%PsKU') + '@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default pool;
