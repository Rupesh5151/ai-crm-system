/**
 * Activity Model - Mongoose Schema
 * Tracks all interactions with leads (timeline)
 */
import mongoose, { Schema } from 'mongoose';

const ActivitySchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'note', 'task', 'status_change'],
      required: [true, 'Activity type is required'],
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null,
    },
    metadata: {
      duration: { type: Number, min: 0, default: null },
      emailSubject: { type: String, default: null },
      emailOpened: { type: Boolean, default: null },
      meetingLocation: { type: String, default: null },
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who performed this activity is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

ActivitySchema.index({ leadId: 1, createdAt: -1 });
ActivitySchema.index({ performedBy: 1, createdAt: -1 });
ActivitySchema.index({ type: 1, createdAt: -1 });

ActivitySchema.post('save', async function (doc) {
  if (doc.type === 'email' || doc.type === 'call' || doc.type === 'meeting') {
    const { Lead } = require('./Lead');
    await Lead.findByIdAndUpdate(doc.leadId, { $inc: { interactionCount: 1 } });
  }
});

export const Activity = mongoose.model('Activity', ActivitySchema);

