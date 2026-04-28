/**
 * Activity Validation Schemas
 */
import { z } from 'zod';

export const createActivitySchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  type: z.enum(['call', 'email', 'meeting', 'note', 'task', 'status_change']),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  metadata: z.object({
    duration: z.number().min(0).optional(),
    emailSubject: z.string().optional(),
    emailOpened: z.boolean().optional(),
    meetingLocation: z.string().optional(),
  }).optional(),
});

export const updateActivitySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  metadata: z.object({
    duration: z.number().min(0).optional(),
    emailSubject: z.string().optional(),
    emailOpened: z.boolean().optional(),
    meetingLocation: z.string().optional(),
  }).optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

