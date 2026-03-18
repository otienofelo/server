import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/db.js';

import farmerRoutes from './routes/farmers.js';
import animalRoutes from './routes/animals.js';
import visitRoutes from './routes/visits.js';
import diseaseRoutes from './routes/diseases.js';
import userRoutes from './routes/users.js';
import vaccinationRoutes from './routes/vaccinations.js';
import feedingRoutes from './routes/feeding.js';

import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://frontend-iasp.onrender.com"
  ],
  credentials: true
}));

app.use('/api/farmers', farmerRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/feeding', feedingRoutes);

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database()');
    res.send(`The current database is: ${result.rows[0].current_database}`);
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).send('Database connection error');
  }
});

app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;