import pool from '../config/db.js';

// Get all farmers for the authenticated user
export const getFarmers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM farmers WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.uid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single farmer
export const getFarmerById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM farmers WHERE id = $1 AND user_id = $2',
      [id, req.user.uid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new farmer
export const createFarmer = async (req, res) => {
  const { name, phone, village, farmSize } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO farmers (user_id, name, phone, village, farm_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.uid, name, phone, village, farmSize]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a farmer
export const updateFarmer = async (req, res) => {
  const { id } = req.params;
  const { name, phone, village, farmSize } = req.body;
  try {
    const result = await pool.query(
      'UPDATE farmers SET name = $1, phone = $2, village = $3, farm_size = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6 RETURNING *',
      [name, phone, village, farmSize, id, req.user.uid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a farmer
export const deleteFarmer = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM farmers WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.uid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json({ message: 'Farmer deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};