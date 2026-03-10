import pool from '../config/db.js';

export const getVaccinations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, a.tag as animal_tag, a.species as animal_species, f.name as farmer_name
       FROM vaccinations v
       LEFT JOIN animals a ON v.animal_id = a.id
       LEFT JOIN farmers f ON a.farmer_id = f.id
       WHERE v.user_id = $1
       ORDER BY v.next_due_date ASC NULLS LAST`,
      [req.user.uid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getVaccinations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUpcomingVaccinations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, a.tag as animal_tag, a.species as animal_species
       FROM vaccinations v
       LEFT JOIN animals a ON v.animal_id = a.id
       WHERE v.user_id = $1
         AND v.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
       ORDER BY v.next_due_date ASC`,
      [req.user.uid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getUpcomingVaccinations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getVaccinationsByAnimal = async (req, res) => {
  const { animalId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM vaccinations
       WHERE animal_id = $1 AND user_id = $2
       ORDER BY date_administered DESC`,
      [animalId, req.user.uid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getVaccinationsByAnimal error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createVaccination = async (req, res) => {
  const { animalId, vaccineName, dateAdministered, nextDueDate, vetResponsible, notes } = req.body;
  try {
    const animalCheck = await pool.query(
      'SELECT id FROM animals WHERE id = $1 AND user_id = $2',
      [animalId, req.user.uid]
    );
    if (animalCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid animal ID' });
    }

    const result = await pool.query(
      `INSERT INTO vaccinations (user_id, animal_id, vaccine_name, date_administered, next_due_date, vet_responsible, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.uid, animalId, vaccineName, dateAdministered, nextDueDate || null, vetResponsible || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createVaccination error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateVaccination = async (req, res) => {
  const { id } = req.params;
  const { vaccineName, dateAdministered, nextDueDate, vetResponsible, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE vaccinations SET
        vaccine_name = COALESCE($1, vaccine_name),
        date_administered = COALESCE($2, date_administered),
        next_due_date = COALESCE($3, next_due_date),
        vet_responsible = COALESCE($4, vet_responsible),
        notes = COALESCE($5, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [vaccineName, dateAdministered, nextDueDate, vetResponsible, notes, id, req.user.uid]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Vaccination not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateVaccination error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteVaccination = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM vaccinations WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.uid]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Vaccination not found' });
    res.json({ message: 'Vaccination deleted' });
  } catch (err) {
    console.error('deleteVaccination error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};