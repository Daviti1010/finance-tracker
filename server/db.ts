import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config()

const pool = new pg.Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: Number(process.env.PORT),
  ssl: false
})

export default pool