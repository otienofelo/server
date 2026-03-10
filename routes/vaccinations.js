import express from 'express';
import authenticate from '../middleware/auth.js';
import { attachRole } from '../middleware/checkRole.js';
import {
  getVaccinations, getUpcomingVaccinations, getVaccinationsByAnimal,
  createVaccination, updateVaccination, deleteVaccination
} from '../controllers/vaccinationController.js';

const router = express.Router();
router.use(authenticate);
router.use(attachRole);

router.get('/', getVaccinations);
router.get('/upcoming', getUpcomingVaccinations);
router.get('/animal/:animalId', getVaccinationsByAnimal);
router.post('/', createVaccination);
router.put('/:id', updateVaccination);
router.delete('/:id', deleteVaccination);

export default router;