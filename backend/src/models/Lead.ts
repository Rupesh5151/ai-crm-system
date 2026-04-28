/**
 * Lead Model - Mongoose Schema
 * Core CRM entity with AI scoring fields
 */
import mongoose, { Schema } from 'mongoose';

const LeadSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    title: {
      type: String,
      trim: true,
      default: null,
    },
    industry: {
      type: String,
      enum: ['technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'education', 'other'],
      default: 'other',
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      default: '1-10',
    },
    source: {
      type: String,
      enum: ['linkedin', 'ads', 'referral', 'website', 'email', 'event', 'cold_call', 'other'],
      required: [true, 'Lead source is required'],
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'],
      default: 'new',
    },
    score: {
      type: Number,
      min: [0, 'Score must be at least 0'],
      max: [100, 'Score cannot exceed 100'],
      default: null,
    },
    scoreLabel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: null,
    },
    interactionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    emailOpenRate: {
      type: Number,
      default: 0,
      min: [0, 'Rate must be at least 0'],
      max: [100, 'Rate cannot exceed 100'],
    },
    estimatedValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
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

LeadSchema.index({ isActive: 1, status: 1 });
LeadSchema.index({ isActive: 1, source: 1 });
LeadSchema.index({ isActive: 1, assignedTo: 1 });
LeadSchema.index({ isActive: 1, scoreLabel: 1 });
LeadSchema.index({ isActive: 1, createdAt: -1 });
LeadSchema.index({ name: 'text', email: 'text', company: 'text' }, { weights: { name: 10, company: 5, email: 3 } });

export const Lead = mongoose.model('Lead', LeadSchema);

