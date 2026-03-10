import express from 'express';
import authenticate from '../middleware/auth.js';
import {
  getVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
} from '../controllers/visitController.js';

const router = express.Router();
router.use(authenticate);

router.get('/', getVisits); 
router.get('/:id', getVisitById);
router.post('/', createVisit);
router.put('/:id', updateVisit);
router.delete('/:id', deleteVisit);

export default router;