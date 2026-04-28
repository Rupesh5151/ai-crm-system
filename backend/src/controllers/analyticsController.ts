/**
 * Analytics Controller
 * Dashboard KPIs and pipeline analytics
 */
import { Request, Response } from 'express';
import { Lead, Activity } from '../models';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalLeads,
      newLeadsThisMonth,
      newLeadsLastMonth,
      wonLeads,
      lostLeads,
      totalRevenue,
      avgScore,
      recentActivities,
    ] = await Promise.all([
      Lead.countDocuments({ isActive: true }),
      Lead.countDocuments({ isActive: true, createdAt: { $gte: startOfMonth } }),
      Lead.countDocuments({ isActive: true, createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
      Lead.countDocuments({ isActive: true, status: 'won' }),
      Lead.countDocuments({ isActive: true, status: 'lost' }),
      Lead.aggregate([{ $match: { isActive: true, status: 'won' } }, { $group: { _id: null, total: { $sum: '$estimatedValue' } } }]),
      Lead.aggregate([{ $match: { isActive: true, score: { $exists: true, $ne: null } } }, { $group: { _id: null, avg: { $avg: '$score' } } }]),
      Activity.find().sort({ createdAt: -1 }).limit(10).populate('performedBy', 'name').populate('leadId', 'name company').lean(),
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const score = avgScore[0]?.avg || 0;
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(2) : '0';
    const leadsGrowth = newLeadsLastMonth > 0 ? (((newLeadsThisMonth - newLeadsLastMonth) / newLeadsLastMonth) * 100).toFixed(2) : newLeadsThisMonth > 0 ? '100' : '0';

    successResponse(res, {
      totalLeads,
      newLeadsThisMonth,
      wonLeads,
      lostLeads,
      revenue,
      conversionRate: parseFloat(conversionRate),
      avgScore: Math.round(score),
      leadsGrowth: parseFloat(leadsGrowth),
      recentActivities,
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    errorResponse(res, 'Failed to retrieve dashboard stats', 500, error);
  }
};

export const getPipelineDistribution = async (_req: Request, res: Response): Promise<void> => {
  try {
    const distribution = await Lead.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$estimatedValue' } } },
      { $sort: { _id: 1 } },
    ]);

    const statuses = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
    const result = statuses.map((status) => {
      const found = distribution.find((d) => d._id === status);
      return { status, count: found?.count || 0, totalValue: found?.totalValue || 0 };
    });

    successResponse(res, result);
  } catch (error) {
    logger.error('Pipeline distribution error:', error);
    errorResponse(res, 'Failed to retrieve pipeline distribution', 500, error);
  }
};

export const getLeadSources = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sources = await Lead.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 }, converted: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } } } },
      { $sort: { count: -1 } },
    ]);

    successResponse(res, sources.map((s) => ({
      source: s._id,
      count: s.count,
      converted: s.converted,
      conversionRate: s.count > 0 ? ((s.converted / s.count) * 100).toFixed(2) : '0',
    })));
  } catch (error) {
    logger.error('Lead sources error:', error);
    errorResponse(res, 'Failed to retrieve lead sources', 500, error);
  }
};

export const getConversionFunnel = async (_req: Request, res: Response): Promise<void> => {
  try {
    const funnel = await Lead.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
    const statusOrder = ['new', 'contacted', 'qualified', 'proposal', 'won'];
    const result = statusOrder.map((status) => {
      const found = funnel.find((f) => f._id === status);
      return { status, count: found?.count || 0 };
    });
    successResponse(res, result);
  } catch (error) {
    logger.error('Conversion funnel error:', error);
    errorResponse(res, 'Failed to retrieve conversion funnel', 500, error);
  }
};

export const getRevenueTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { months = '6' } = req.query;
    const numMonths = parseInt(months as string);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - numMonths + 1, 1);

    const trends = await Lead.aggregate([
      { $match: { isActive: true, status: 'won', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$estimatedValue' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const result = trends.map((t) => ({
      year: t._id.year,
      month: t._id.month,
      revenue: t.revenue,
      count: t.count,
    }));

    successResponse(res, result);
  } catch (error) {
    logger.error('Revenue trends error:', error);
    errorResponse(res, 'Failed to retrieve revenue trends', 500, error);
  }
};

