import express from 'express';
import authenticate from '../middleware/auth.js';
import {
  getFarmers,
  getFarmerById,
  createFarmer,
  updateFarmer,
  deleteFarmer,
} from '../controllers/farmerController.js';

const router = express.Router();

// All routes below require authentication
router.use(authenticate);

router.get('/', getFarmers);
router.get('/:id', getFarmerById);
router.post('/', createFarmer);
router.put('/:id', updateFarmer);
router.delete('/:id', deleteFarmer);

export default router;