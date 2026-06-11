import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import pool from './db';
import authRoutes from './routes/auth'

const app = express();
const PORT = 3000;

pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err));

app.use(express.json())

app.use('/auth', authRoutes)




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default pool