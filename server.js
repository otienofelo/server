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
app.get('/seed-diseases', async (req, res) => {
  try {
    await pool.query(`
      INSERT INTO diseases (user_id, name, species, symptoms, treatment, prevention, status) VALUES
      ('system', 'Foot and Mouth Disease', 'cow', ARRAY['fever','lameness','blisters','drooling','loss of appetite'], 'Supportive care, antibiotics for secondary infections', 'Vaccination, restrict movement', 'approved'),
      ('system', 'Mastitis', 'cow', ARRAY['swollen udder','pain','fever','reduced milk','clots in milk'], 'Antibiotics, anti-inflammatory drugs', 'Proper milking hygiene, teat dipping', 'approved'),
      ('system', 'Bovine Respiratory Disease', 'cow', ARRAY['coughing','nasal discharge','fever','difficulty breathing','lethargy'], 'Antibiotics, anti-inflammatory drugs', 'Vaccination, reduce stress', 'approved'),
      ('system', 'East Coast Fever', 'cow', ARRAY['fever','swollen lymph nodes','nasal discharge','difficulty breathing','loss of appetite'], 'Buparvaquone injection', 'Tick control, vaccination', 'approved'),
      ('system', 'Lumpy Skin Disease', 'cow', ARRAY['fever','skin nodules','swollen lymph nodes','nasal discharge','lameness'], 'Supportive treatment, antibiotics', 'Vaccination, insect control', 'approved'),
      ('system', 'Contagious Caprine Pleuropneumonia', 'goat', ARRAY['coughing','fever','difficulty breathing','nasal discharge','loss of appetite'], 'Antibiotics, supportive care', 'Vaccination, quarantine new animals', 'approved'),
      ('system', 'Goat Pox', 'goat', ARRAY['fever','skin lesions','nasal discharge','loss of appetite','lethargy'], 'Supportive care, antiseptic on lesions', 'Vaccination', 'approved'),
      ('system', 'Peste des Petits Ruminants', 'goat', ARRAY['fever','nasal discharge','diarrhea','mouth sores','coughing'], 'Supportive care, antibiotics for secondary infections', 'Vaccination', 'approved'),
      ('system', 'Caseous Lymphadenitis', 'goat', ARRAY['swollen lymph nodes','weight loss','lethargy','abscess'], 'Surgical drainage, antibiotics', 'Vaccination, biosecurity', 'approved'),
      ('system', 'Sheep Pox', 'sheep', ARRAY['fever','skin lesions','nasal discharge','loss of appetite','lethargy'], 'Supportive care, antiseptic treatment', 'Vaccination', 'approved'),
      ('system', 'Ovine Pulmonary Adenocarcinoma', 'sheep', ARRAY['difficulty breathing','weight loss','nasal discharge','coughing','lethargy'], 'No treatment available', 'Cull infected animals, biosecurity', 'approved'),
      ('system', 'Bluetongue', 'sheep', ARRAY['fever','swollen face','blue tongue','lameness','nasal discharge'], 'Supportive care, antibiotics', 'Vaccination, insect control', 'approved'),
      ('system', 'Newcastle Disease', 'chicken', ARRAY['coughing','sneezing','nasal discharge','paralysis','twisting neck'], 'No specific treatment, supportive care', 'Vaccination', 'approved'),
      ('system', 'Fowl Pox', 'chicken', ARRAY['skin lesions','mouth sores','nasal discharge','loss of appetite','lethargy'], 'Supportive care, antiseptic', 'Vaccination, insect control', 'approved'),
      ('system', 'Infectious Bursal Disease', 'chicken', ARRAY['diarrhea','loss of appetite','depression','ruffled feathers','trembling'], 'Supportive care, vitamins', 'Vaccination', 'approved'),
      ('system', 'Coccidiosis', 'chicken', ARRAY['diarrhea','blood in droppings','loss of appetite','lethargy','ruffled feathers'], 'Anticoccidial drugs', 'Clean dry housing, good sanitation', 'approved')
    ON CONFLICT DO NOTHING
    `);
    res.json({ message: '✅ Diseases seeded successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
});
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;