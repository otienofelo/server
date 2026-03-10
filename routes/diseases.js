import express from 'express';
import authenticate from '../middleware/auth.js';
import { attachRole, requireRole } from '../middleware/checkRole.js';
import {
  getDiseases,
  getDiseaseById,
  getPendingDiseases,
  createDisease,
  updateDisease,
  reviewDisease,
  deleteDisease,
} from '../controllers/diseaseController.js';

const router = express.Router();

router.use(authenticate);
router.use(attachRole);

// Admin, Vet, Researcher can VIEW approved diseases
router.get('/', requireRole('admin', 'vet', 'researcher'), getDiseases);
router.get('/pending', requireRole('admin'), getPendingDiseases);
router.get('/:id', requireRole('admin', 'vet', 'researcher'), getDiseaseById);

// Admin + Vet + Researcher can CREATE (researcher goes to pending)
router.post('/', requireRole('admin', 'vet', 'researcher'), createDisease);

//Admin + Vet + Researcher can UPDATE (with restrictions in controller)
router.put('/:id', requireRole('admin', 'vet', 'researcher'), updateDisease);

//Admin only — approve or reject
router.patch('/:id/review', requireRole('admin'), reviewDisease);

//Admin only — delete
router.delete('/:id', requireRole('admin'), deleteDisease);

export default router;