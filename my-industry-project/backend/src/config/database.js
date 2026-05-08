import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// log errors
pool.on("error", (err) => {
  console.error("PG Error:", err);
  process.exit(1);
});

// helper query function
const query = (text, params) => pool.query(text, params);

export { pool, query };
