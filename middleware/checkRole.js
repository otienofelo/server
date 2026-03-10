//attaches role to req.user and blocks unauthorized access
import pool from '../config/db.js';

// Middleware fetch user role from DB and attach to req
export const attachRole = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE firebase_uid = $1',
      [req.user.uid]
    );

    if (result.rows.length === 0) {
      // Auto-create with default role 'vet' on first request
      const created = await pool.query(
        `INSERT INTO users (firebase_uid, email, name, role)
         VALUES ($1, $2, $3, 'vet') RETURNING role`,
        [req.user.uid, req.user.email || '', req.user.name || '']
      );
      req.user.role = created.rows[0].role;
    } else {
      req.user.role = result.rows[0].role;
    }

    next();
  } catch (err) {
    console.error('attachRole error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware restrict to specific roles
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({ message: 'No role assigned' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }
    next();
  };
};