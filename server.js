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

// TEMPORARY - remove after running once
app.get('/setup-db', async (req, res) => {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        firebase_uid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'farmer' CHECK (role IN ('admin','vet','researcher','farmer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS animals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
        tag VARCHAR(100) NOT NULL,
        species VARCHAR(100),
        breed VARCHAR(100),
        age INTEGER,
        weight DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
        visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        symptoms TEXT,
        diseases JSONB,
        treatment TEXT,
        notes TEXT,
        animal_tag VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS diseases (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        symptoms TEXT[],
        treatment TEXT,
        prevention TEXT,
        status VARCHAR(50) DEFAULT 'approved',
        submitted_by VARCHAR(255),
        reviewed_by VARCHAR(255),
        review_note TEXT,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vaccinations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
        vaccine_name VARCHAR(255) NOT NULL,
        date_administered DATE NOT NULL,
        next_due_date DATE,
        vet_responsible VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feeding_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
        feed_type VARCHAR(255) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit VARCHAR(50) DEFAULT 'kg',
        feeding_time TIMESTAMP NOT NULL,
        cost DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    await pool.query(`
      INSERT INTO users (firebase_uid, email, role)
      VALUES ('vgCX1RpYR3Uij0NrI5CSRmPdzKv1', 'your@email.com', 'admin')
      ON CONFLICT (firebase_uid) DO UPDATE SET role = 'admin'
    `);
    res.json({ message: 'All tables created and admin set!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: ' Error: ' + err.message });
  }
});

app.use(errorHandler);

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;