import express from 'express';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import linksRouter from './routes/links';
import clientsRouter from './routes/clients';
import chatRouter from './routes/chat';
import cors from 'cors';

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);
app.use('/api/links', linksRouter);
app.use('/clients', clientsRouter);
app.use('/api/chat', chatRouter);

export default app;