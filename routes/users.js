import express from 'express';
import authenticate from '../middleware/auth.js';
import { attachRole, requireRole } from '../middleware/checkRole.js';
import { getMe, getUsers, updateUserRole } from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(attachRole);

// Get current user profile
router.get('/me', getMe);

// Admin only — manage all users
router.get('/', requireRole('admin'), getUsers);
router.put('/:id/role', requireRole('admin'), updateUserRole);

export default router;