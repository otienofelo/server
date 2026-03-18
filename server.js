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
app.get('/fix-all-tables', async (req, res) => {
  try {
    // Fix animals
    await pool.query(`DROP TABLE IF EXISTS vaccinations CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS feeding_logs CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS visits CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS animals CASCADE`);
    await pool.query(`
      CREATE TABLE animals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
        tag VARCHAR(100) NOT NULL,
        species VARCHAR(100),
        breed VARCHAR(100),
        age INTEGER,
        status VARCHAR(50) DEFAULT 'healthy',
        weight DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Fix diseases
    await pool.query(`DROP TABLE IF EXISTS diseases CASCADE`);
    await pool.query(`
      CREATE TABLE diseases (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        species VARCHAR(100),
        description TEXT,
        symptoms TEXT[],
        treatment TEXT,
        prevention TEXT,
        status VARCHAR(50) DEFAULT 'approved',
        submitted_by VARCHAR(255),
        reviewed_by VARCHAR(255),
        review_note TEXT,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Recreate visits
    await pool.query(`
      CREATE TABLE visits (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
        visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        symptoms TEXT,
        diseases JSONB,
        treatment TEXT,
        notes TEXT,
        animal_tag VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Recreate vaccinations
    await pool.query(`
      CREATE TABLE vaccinations (
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
      )
    `);

    // Recreate feeding_logs
    await pool.query(`
      CREATE TABLE feeding_logs (
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
      )
    `);

    res.json({ message: '✅ All tables fixed!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: ' ' + err.message });
  }
});

app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;