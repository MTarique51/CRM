import mongoose, { Schema } from "mongoose";
const opts = { timestamps: true };
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["Admin", "Manager", "SalesExecutive"],
      default: "SalesExecutive",
    },
    team: { type: String, default: "Sales" },
    isActive: { type: Boolean, default: true },
    failedLoginCount: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },
  },
  opts,
);
const CustomerSchema = new Schema(
  {
    customerCode: String,
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    company: String,
    address: String,
    city: String,
    state: String,
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: String,
    createdBy: Schema.Types.ObjectId,
  },
  opts,
);
CustomerSchema.index({ email: 1 }, { unique: true });
CustomerSchema.index({ phone: 1 }, { unique: true });
const LeadSchema = new Schema(
  {
    leadCode: String,
    name: { type: String, required: true, maxlength: 100 },
    email: String,
    phone: String,
    company: String,
    source: { type: String, default: "Website" },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Qualified",
        "Unqualified",
        "Converted",
        "Lost",
      ],
      default: "New",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    expectedValue: { type: Number, min: 0, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: String,
    convertedCustomer: { type: Schema.Types.ObjectId, ref: "Customer" },
  },
  opts,
);
const OpportunitySchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    lead: { type: Schema.Types.ObjectId, ref: "Lead" },
    amount: { type: Number, required: true, min: 0 },
    stage: {
      type: String,
      enum: ["Qualification", "Proposal", "Negotiation", "Won", "Lost"],
      default: "Qualification",
    },
    probability: { type: Number, min: 0, max: 100, default: 20 },
    expectedCloseDate: { type: Date, required: true },
    status: { type: String, enum: ["Open", "Won", "Lost"], default: "Open" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    source: String,
    notes: String,
  },
  opts,
);
const FollowUpSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    lead: { type: Schema.Types.ObjectId, ref: "Lead" },
    opportunity: { type: Schema.Types.ObjectId, ref: "Opportunity" },
    date: { type: Date, required: true },
    subject: { type: String, required: true, maxlength: 120 },
    type: {
      type: String,
      enum: ["Call", "Meeting", "Email", "Task"],
      default: "Call",
    },
    status: {
      type: String,
      enum: ["Planned", "Completed", "Missed", "Cancelled"],
      default: "Planned",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: String,
  },
  opts,
);
const ActivitySchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Call", "Meeting", "Email", "Task"],
      required: true,
    },
    subject: { type: String, required: true },
    description: String,
    date: { type: Date, default: Date.now },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    lead: { type: Schema.Types.ObjectId, ref: "Lead" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Open", "Completed"], default: "Open" },
  },
  opts,
);
const AuditSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    userName: String,
    action: { type: String, required: true },
    entityName: String,
    recordId: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    ipAddress: String,
    result: { type: String, default: "Success" },
    details: String,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const User: mongoose.Model<any> =
  mongoose.models.User || mongoose.model('User', UserSchema);

export const Customer: mongoose.Model<any> =
  mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

export const Lead: mongoose.Model<any> =
  mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

export const Opportunity: mongoose.Model<any> =
  mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);

export const FollowUp: mongoose.Model<any> =
  mongoose.models.FollowUp || mongoose.model('FollowUp', FollowUpSchema);

export const Activity: mongoose.Model<any> =
  mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

export const AuditLog: mongoose.Model<any> =
  mongoose.models.AuditLog || mongoose.model('AuditLog', AuditSchema);

