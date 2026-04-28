/**
 * Analytics Routes
 * /api/v1/analytics
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getDashboardStats,
  getPipelineDistribution,
  getLeadSources,
  getConversionFunnel,
  getRevenueTrends,
} from '../controllers/analyticsController';

const router = Router();

router.get('/dashboard', authenticate, getDashboardStats);
router.get('/pipeline', authenticate, getPipelineDistribution);
router.get('/sources', authenticate, getLeadSources);
router.get('/conversion', authenticate, getConversionFunnel);
router.get('/revenue', authenticate, getRevenueTrends);

export default router;

