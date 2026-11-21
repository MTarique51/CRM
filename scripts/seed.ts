import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
import bcrypt from "bcryptjs";
import {
  User,
  Customer,
  Lead,
  Opportunity,
  FollowUp,
  Activity,
} from "../models";
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");
  await mongoose.connect(uri);
  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Lead.deleteMany({}),
    Opportunity.deleteMany({}),
    FollowUp.deleteMany({}),
    Activity.deleteMany({}),
  ]);
  const passwordHash = await bcrypt.hash("Admin@123", 12);
  const [admin, manager, sales] = await User.create([
    {
      name: "Aarav Sharma",
      email: "admin@acxiomcrm.com",
      passwordHash,
      role: "Admin",
      team: "Leadership",
    },
    {
      name: "Priya Mehta",
      email: "manager@acxiomcrm.com",
      passwordHash,
      role: "Manager",
      team: "North Sales",
    },
    {
      name: "Rohan Verma",
      email: "sales@acxiomcrm.com",
      passwordHash,
      role: "SalesExecutive",
      team: "North Sales",
    },
  ]);
  const customers = await Customer.create([
    {
      name: "Nexa Technologies",
      email: "hello@nexa.example",
      phone: "9876543210",
      company: "Nexa Technologies",
      city: "Bengaluru",
      state: "Karnataka",
      owner: sales._id,
      createdBy: admin._id,
    },
    {
      name: "BluePeak Retail",
      email: "contact@bluepeak.example",
      phone: "9876543211",
      company: "BluePeak Retail",
      city: "Mumbai",
      state: "Maharashtra",
      owner: sales._id,
      createdBy: admin._id,
    },
    {
      name: "Orbit Healthcare",
      email: "team@orbit.example",
      phone: "9876543212",
      company: "Orbit Healthcare",
      city: "Pune",
      state: "Maharashtra",
      owner: manager._id,
      createdBy: admin._id,
    },
  ]);
  const leads = await Lead.create([
    {
      name: "Ananya Rao",
      email: "ananya@example.com",
      phone: "9876543213",
      company: "Aster Labs",
      source: "Website",
      status: "Qualified",
      priority: "High",
      expectedValue: 450000,
      owner: sales._id,
    },
    {
      name: "Vikram Singh",
      email: "vikram@example.com",
      phone: "9876543214",
      company: "Summit Works",
      source: "Referral",
      status: "Contacted",
      priority: "Medium",
      expectedValue: 180000,
      owner: sales._id,
    },
    {
      name: "Meera Joshi",
      email: "meera@example.com",
      phone: "9876543215",
      company: "Cedar Finance",
      source: "Campaign",
      status: "New",
      priority: "Low",
      expectedValue: 95000,
      owner: manager._id,
    },
  ]);
  const opps = await Opportunity.create([
    {
      name: "Nexa CRM rollout",
      customer: customers[0]._id,
      amount: 850000,
      stage: "Proposal",
      probability: 65,
      expectedCloseDate: new Date(Date.now() + 30 * 86400000),
      owner: sales._id,
    },
    {
      name: "BluePeak annual contract",
      customer: customers[1]._id,
      amount: 520000,
      stage: "Negotiation",
      probability: 80,
      expectedCloseDate: new Date(Date.now() + 45 * 86400000),
      owner: sales._id,
    },
    {
      name: "Orbit support package",
      customer: customers[2]._id,
      amount: 240000,
      stage: "Won",
      probability: 100,
      expectedCloseDate: new Date(Date.now() - 5 * 86400000),
      status: "Won",
      owner: manager._id,
    },
  ]);
  await FollowUp.create([
    {
      subject: "Product demo with Nexa",
      date: new Date(Date.now() + 86400000),
      type: "Meeting",
      status: "Planned",
      customer: customers[0]._id,
      assignedTo: sales._id,
    },
    {
      subject: "Contract discussion",
      date: new Date(Date.now() + 2 * 86400000),
      type: "Call",
      status: "Planned",
      customer: customers[1]._id,
      assignedTo: sales._id,
    },
  ]);
  await Activity.create([
    {
      subject: "Discovery call completed",
      type: "Call",
      description: "Initial requirements discussed.",
      date: new Date(),
      customer: customers[0]._id,
      assignedTo: sales._id,
      status: "Completed",
    },
    {
      subject: "Proposal emailed",
      type: "Email",
      description: "Sent proposal and pricing.",
      date: new Date(),
      customer: customers[1]._id,
      assignedTo: sales._id,
      status: "Completed",
    },
  ]);
  console.log("Seed complete. Demo password for all users: Admin@123");
  await mongoose.disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
