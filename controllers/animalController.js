import pool from '../config/db.js';

// Get all animals for the logged-in user, including farmer name
export const getAnimals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, f.name AS farmer_name
       FROM animals a
       LEFT JOIN farmers f ON a.farmer_id = f.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.uid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single animal by ID
export const getAnimalById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.*, f.name AS farmer_name
       FROM animals a
       LEFT JOIN farmers f ON a.farmer_id = f.id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, req.user.uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new animal
export const createAnimal = async (req, res) => {
  const { farmerId, tag, species, breed, age, status } = req.body;

  try {
    // Verify that the farmer belongs to the current user
    const farmerCheck = await pool.query(
      'SELECT id FROM farmers WHERE id = $1 AND user_id = $2',
      [farmerId, req.user.uid]
    );
    if (farmerCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid farmer ID' });
    }

    const result = await pool.query(
      `INSERT INTO animals (user_id, farmer_id, tag, species, breed, age, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.uid, farmerId, tag, species, breed, age, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update animal
export const updateAnimal = async (req, res) => {
  const { id } = req.params;
  const { farmerId, tag, species, breed, age, status } = req.body;

  try {
    // Verify farmer ownership if farmerId is updated
    if (farmerId) {
      const farmerCheck = await pool.query(
        'SELECT id FROM farmers WHERE id = $1 AND user_id = $2',
        [farmerId, req.user.uid]
      );
      if (farmerCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid farmer ID' });
      }
    }

    const result = await pool.query(
      `UPDATE animals
       SET farmer_id = COALESCE($1, farmer_id),
           tag = COALESCE($2, tag),
           species = COALESCE($3, species),
           breed = COALESCE($4, breed),
           age = COALESCE($5, age),
           status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [farmerId, tag, species, breed, age, status, id, req.user.uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete animal
export const deleteAnimal = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM animals WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    res.json({ message: 'Animal deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};