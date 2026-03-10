import pool from '../config/db.js';

export const getFeedingLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fl.*, a.tag as animal_tag, a.species as animal_species
       FROM feeding_logs fl
       LEFT JOIN animals a ON fl.animal_id = a.id
       WHERE fl.user_id = $1
       ORDER BY fl.feeding_time DESC`,
      [req.user.uid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getFeedingLogs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDailyFeedingLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fl.*, a.tag as animal_tag, a.species as animal_species
       FROM feeding_logs fl
       LEFT JOIN animals a ON fl.animal_id = a.id
       WHERE fl.user_id = $1
         AND DATE(fl.feeding_time) = CURRENT_DATE
       ORDER BY fl.feeding_time DESC`,
      [req.user.uid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getDailyFeedingLogs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMonthlyCostSummary = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         DATE_TRUNC('month', feeding_time) as month,
         SUM(cost) as total_cost,
         COUNT(*) as total_feedings,
         SUM(quantity) as total_quantity
       FROM feeding_logs
       WHERE user_id = $1
       GROUP BY DATE_TRUNC('month', feeding_time)
       ORDER BY month DESC
       LIMIT 6`,
      [req.user.uid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getMonthlyCostSummary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createFeedingLog = async (req, res) => {
  const { animalId, feedType, quantity, unit, feedingTime, cost, notes } = req.body;
  try {
    const animalCheck = await pool.query(
      'SELECT id FROM animals WHERE id = $1 AND user_id = $2',
      [animalId, req.user.uid]
    );
    if (animalCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid animal ID' });
    }

    const result = await pool.query(
      `INSERT INTO feeding_logs (user_id, animal_id, feed_type, quantity, unit, feeding_time, cost, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.uid, animalId, feedType, quantity, unit || 'kg', feedingTime, cost || 0, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createFeedingLog error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateFeedingLog = async (req, res) => {
  const { id } = req.params;
  const { feedType, quantity, unit, feedingTime, cost, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE feeding_logs SET
        feed_type = COALESCE($1, feed_type),
        quantity = COALESCE($2, quantity),
        unit = COALESCE($3, unit),
        feeding_time = COALESCE($4, feeding_time),
        cost = COALESCE($5, cost),
        notes = COALESCE($6, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [feedType, quantity, unit, feedingTime, cost, notes, id, req.user.uid]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Feeding log not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateFeedingLog error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteFeedingLog = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM feeding_logs WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.uid]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Feeding log not found' });
    res.json({ message: 'Feeding log deleted' });
  } catch (err) {
    console.error('deleteFeedingLog error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};