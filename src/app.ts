import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { incidentsRouter } from './routes/incidents.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/incidents', incidentsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

export { app };