import pool from '../config/db.js';

// GET all diseases — only approved ones
export const getDiseases = async (req, res) => {
  try {
    const role = req.user.role;

    let query;
    let params;

    if (role === 'admin') {
      // Admin sees everything including pending and rejected
      query = `
        SELECT d.*, u.email as submitted_by_email
        FROM diseases d
        LEFT JOIN users u ON d.submitted_by = u.firebase_uid
        WHERE d.user_id = 'system' OR d.user_id = $1
        ORDER BY d.status ASC, d.created_at DESC
      `;
      params = [req.user.uid];
    } else {
      // Everyone else only sees approved diseases
      query = `
        SELECT d.*
        FROM diseases d
        WHERE (d.user_id = 'system' OR d.user_id = $1)
          AND d.status = 'approved'
        ORDER BY d.created_at DESC
      `;
      params = [req.user.uid];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('getDiseases error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET pending diseases (admin only)
export const getPendingDiseases = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, u.email as submitted_by_email
       FROM diseases d
       LEFT JOIN users u ON d.submitted_by = u.firebase_uid
       WHERE d.status = 'pending'
       ORDER BY d.created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getPendingDiseases error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET single disease
export const getDiseaseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM diseases WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Disease not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getDiseaseById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// CREATE disease
export const createDisease = async (req, res) => {
  const { name, species, symptoms, prevention, treatment } = req.body;
  const role = req.user.role;

  const status = role === 'researcher' ? 'pending' : 'approved';

  try {
    const result = await pool.query(
      `INSERT INTO diseases (user_id, name, species, symptoms, prevention, treatment, status, submitted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.uid,
        name,
        species,
        symptoms,
        prevention,
        treatment,
        status,
        req.user.uid
      ]
    );

    res.status(201).json({
      ...result.rows[0],
      message: status === 'pending'
        ? 'Disease submitted for admin approval.'
        : 'Disease added to library.'
    });
  } catch (err) {
    console.error('createDisease error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE disease

export const updateDisease = async (req, res) => {
  const { id } = req.params;
  const { name, species, symptoms, prevention, treatment } = req.body;
  const role = req.user.role;

  try {
    // Fetch current disease
    const existing = await pool.query('SELECT * FROM diseases WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    const disease = existing.rows[0];

    // Researcher can only edit their own pending submissions
    if (role === 'researcher') {
      if (disease.submitted_by !== req.user.uid || disease.status !== 'pending') {
        return res.status(403).json({
          message: 'Researchers can only edit their own pending submissions.'
        });
      }
    }

    const result = await pool.query(
      `UPDATE diseases
       SET name = COALESCE($1, name),
           species = COALESCE($2, species),
           symptoms = COALESCE($3, symptoms),
           prevention = COALESCE($4, prevention),
           treatment = COALESCE($5, treatment),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, species, symptoms, prevention, treatment, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateDisease error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// APPROVE or REJECT disease (admin only)
export const reviewDisease = async (req, res) => {
  const { id } = req.params;
  const { status, review_note } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  try {
    const result = await pool.query(
      `UPDATE diseases
       SET status = $1,
           reviewed_by = $2,
           review_note = $3,
           reviewed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, req.user.uid, review_note || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    res.json({
      ...result.rows[0],
      message: `Disease ${status} successfully.`
    });
  } catch (err) {
    console.error('reviewDisease error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE disease (admin only)
export const deleteDisease = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM diseases WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Disease not found' });
    }
    res.json({ message: 'Disease deleted' });
  } catch (err) {
    console.error('deleteDisease error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};