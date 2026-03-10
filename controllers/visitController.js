import pool from '../config/db.js';

// Get all visits for the logged in user
export const getVisits = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, a.tag as animal_tag, a.species as animal_species
       FROM visits v
       LEFT JOIN animals a ON v.animal_id = a.id
       WHERE v.user_id = $1
       ORDER BY v.created_at DESC`,
      [req.user.uid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single visit by ID
export const getVisitById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT v.*, a.tag as animal_tag, a.species as animal_species
       FROM visits v
       LEFT JOIN animals a ON v.animal_id = a.id
       WHERE v.id = $1 AND v.user_id = $2`,
      [id, req.user.uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new visit
export const createVisit = async (req, res) => {
  const { animalId, date, symptoms, diseases, notes } = req.body;

  try {
    // Verify the animal belongs to the user
    const animalCheck = await pool.query(
      'SELECT id FROM animals WHERE id = $1 AND user_id = $2',
      [animalId, req.user.uid]
    );
    if (animalCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid animal ID' });
    }

    const result = await pool.query(
      `INSERT INTO visits (user_id, animal_id, date, symptoms, diseases, notes)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)
       RETURNING *`,
      [
        req.user.uid,
        animalId,
        date || new Date(),
        symptoms || [],
        JSON.stringify(diseases || []), //explicitly stringify for JSONB
        notes || ''
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createVisit error:', err); 
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a visit
export const updateVisit = async (req, res) => {
  const { id } = req.params;
  const { animalId, date, symptoms, diseases, notes } = req.body;

  try {
    if (animalId) {
      const animalCheck = await pool.query(
        'SELECT id FROM animals WHERE id = $1 AND user_id = $2',
        [animalId, req.user.uid]
      );
      if (animalCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid animal ID' });
      }
    }

    const result = await pool.query(
      `UPDATE visits
       SET animal_id = COALESCE($1, animal_id),
           date = COALESCE($2, date),
           symptoms = COALESCE($3, symptoms),
           diseases = COALESCE($4::jsonb, diseases),
           notes = COALESCE($5, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        animalId,
        date,
        symptoms,
        diseases ? JSON.stringify(diseases) : null,
        notes,
        id,
        req.user.uid
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateVisit error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a visit
export const deleteVisit = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM visits WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    res.json({ message: 'Visit deleted' });
  } catch (err) {
    console.error('deleteVisit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};