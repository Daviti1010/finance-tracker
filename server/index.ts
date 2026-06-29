import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import pool from './db';
import authRoutes from './routes/auth'
import transactionRoutes from './routes/transactions'
import cors from 'cors'

const app = express();
const PORT = 3000;

pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err));

app.use(express.json())

app.use(cors({
    origin: 'http://localhost:5173'
}))

app.use('/auth', authRoutes)
app.use('/transactions', transactionRoutes)




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default pool