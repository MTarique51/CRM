import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  Customer,
  Lead,
  Opportunity,
  FollowUp,
  Activity,
  User,
} from "@/models";
import { requireUser, getOwnerScope } from "@/lib/auth";
export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();
    const own = await getOwnerScope(user, "owner");
    const followOwn = await getOwnerScope(user, "assignedTo");
    const [
      customers,
      leads,
      openLeads,
      opportunities,
      openOpps,
      won,
      lost,
      pipeline,
      pending,
      activities,
      leadStats,
      oppStats,
      monthlySales,
      users,
    ] = await Promise.all([
      Customer.countDocuments(own),
      Lead.countDocuments(own),
      Lead.countDocuments({
        ...own,
        status: { $nin: ["Lost", "Converted", "Unqualified"] },
      }),
      Opportunity.countDocuments(own),
      Opportunity.countDocuments({ ...own, status: "Open" }),
      Opportunity.countDocuments({ ...own, status: "Won" }),
      Opportunity.countDocuments({ ...own, status: "Lost" }),
      Opportunity.aggregate([
        { $match: { ...own, status: "Open" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            weighted: {
              $sum: {
                $multiply: ["$amount", { $divide: ["$probability", 100] }],
              },
            },
          },
        },
      ]),
      FollowUp.countDocuments({ ...followOwn, status: "Planned" }),
      Activity.find(followOwn)
        .sort({ date: -1 })
        .limit(6)
        .populate("assignedTo", "name"),
      Lead.aggregate([
        { $match: own },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Opportunity.aggregate([
        { $match: own },
        {
          $group: {
            _id: "$stage",
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
          },
        },
      ]),
      Opportunity.aggregate([
        { $match: { ...own, status: "Won" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
            sales: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      user.role === "Admin" ? User.countDocuments() : Promise.resolve(0),
    ]);
    return NextResponse.json({
      stats: {
        customers,
        leads,
        openLeads,
        opportunities,
        openOpps,
        won,
        lost,
        pipeline: pipeline[0]?.total || 0,
        weighted: pipeline[0]?.weighted || 0,
        pending,
        users,
      },
      leadStats,
      oppStats,
      monthlySales,
      activities,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error:
          e.message === "UNAUTHORIZED"
            ? "Authentication required."
            : "Unable to load dashboard.",
      },
      { status: e.message === "UNAUTHORIZED" ? 401 : 500 },
    );
  }
}
