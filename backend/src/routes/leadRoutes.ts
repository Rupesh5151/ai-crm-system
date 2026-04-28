/**
 * Lead Routes
 * /api/v1/leads
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { createLeadSchema, updateLeadSchema, leadFiltersSchema } from '../validation/leadSchema';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  recalculateScore,
} from '../controllers/leadController';

const router = Router();

router.get('/', authenticate, validateQuery(leadFiltersSchema), getLeads);
router.post('/', authenticate, validateBody(createLeadSchema), createLead);
router.get('/:id', authenticate, getLead);
router.patch('/:id', authenticate, validateBody(updateLeadSchema), updateLead);
router.delete('/:id', authenticate, deleteLead);
router.patch('/:id/status', authenticate, updateLeadStatus);
router.post('/:id/score', authenticate, recalculateScore);

export default router;

