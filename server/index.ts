import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import pool from './db';

const app = express();
const PORT = 3000;

pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err));

app.use(express.json())






app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default pool