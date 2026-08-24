// import dotenv from 'dotenv';
// dotenv.config();

import pool from './db';
import app from './app';

const PORT = 3000;

pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});