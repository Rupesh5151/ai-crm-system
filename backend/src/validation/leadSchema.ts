/**
 * Lead Validation Schemas
 */
import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Company is required').max(100),
  title: z.string().optional(),
  industry: z.enum(['technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'education', 'other']).optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  source: z.enum(['linkedin', 'ads', 'referral', 'website', 'email', 'event', 'cold_call', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
  estimatedValue: z.number().min(0).optional(),
  assignedTo: z.string().optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().min(1).max(100).optional(),
  title: z.string().optional(),
  industry: z.enum(['technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'education', 'other']).optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  source: z.enum(['linkedin', 'ads', 'referral', 'website', 'email', 'event', 'cold_call', 'other']).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
  estimatedValue: z.number().min(0).optional(),
  assignedTo: z.string().optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

export const leadFiltersSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
  source: z.enum(['linkedin', 'ads', 'referral', 'website', 'email', 'event', 'cold_call', 'other']).optional(),
  industry: z.enum(['technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'education', 'other']).optional(),
  assignedTo: z.string().optional(),
  scoreLabel: z.enum(['high', 'medium', 'low']).optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

