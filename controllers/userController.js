import pool from '../config/db.js';

// Get current user profile
export const getMe = async (req, res) => {
  try {
    let result = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [req.user.uid]
    );

    // Auto-create user record on first login
    if (result.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO users (firebase_uid, email, name, role)
         VALUES ($1, $2, $3, 'vet')
         RETURNING *`,
        [req.user.uid, req.user.email || '', req.user.name || '']
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, firebase_uid, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['admin', 'vet', 'researcher'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE firebase_uid = $2 RETURNING *`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateUserRole error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};