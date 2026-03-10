import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import farmerRoutes from './routes/farmers.js';
import animalRoutes from './routes/animals.js';
import visitRoutes from './routes/visits.js';
import diseaseRoutes from './routes/diseases.js';
import errorHandler from '../middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/farmers', farmerRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/diseases', diseaseRoutes);

app.use(errorHandler)

export default app;