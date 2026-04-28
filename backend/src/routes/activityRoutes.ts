/**
 * Activity Routes
 * /api/v1/activities
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createActivitySchema, updateActivitySchema } from '../validation/activitySchema';
import {
  getActivities,
  getLeadActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../controllers/activityController';

const router = Router();

router.get('/', authenticate, getActivities);
router.get('/lead/:leadId', authenticate, getLeadActivities);
router.post('/', authenticate, validateBody(createActivitySchema), createActivity);
router.patch('/:id', authenticate, validateBody(updateActivitySchema), updateActivity);
router.delete('/:id', authenticate, deleteActivity);

export default router;

