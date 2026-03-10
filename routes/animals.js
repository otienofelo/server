import express from 'express';
import authenticate from '../middleware/auth.js';
import {
  getAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from '../controllers/animalController.js';

const router = express.Router();
router.use(authenticate);

// Include farmer name with each animal
router.get('/', getAnimals); 
router.get('/:id', getAnimalById);
router.post('/', createAnimal);
router.put('/:id', updateAnimal);
router.delete('/:id', deleteAnimal);

export default router;