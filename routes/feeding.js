import express from 'express';
import authenticate from '../middleware/auth.js';
import { attachRole } from '../middleware/checkRole.js';
import {
  getFeedingLogs, getDailyFeedingLogs, getMonthlyCostSummary,
  createFeedingLog, updateFeedingLog, deleteFeedingLog
} from '../controllers/feedingController.js';

const router = express.Router();
router.use(authenticate);
router.use(attachRole);

router.get('/', getFeedingLogs);
router.get('/daily', getDailyFeedingLogs);
router.get('/monthly-cost', getMonthlyCostSummary);
router.post('/', createFeedingLog);
router.put('/:id', updateFeedingLog);
router.delete('/:id', deleteFeedingLog);

export default router;