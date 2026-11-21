import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer, Lead, Opportunity } from "@/models";
import { requireUser, getOwnerScope } from "@/lib/auth";
export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();
    const customerFilter: any = await getOwnerScope(user, "owner"),
      leadFilter: any = await getOwnerScope(user, "owner"),
      oppFilter: any = await getOwnerScope(user, "owner");
    const [customers, leads, opportunities, won, pipeline, conversion] =
      await Promise.all([
        Customer.countDocuments(customerFilter),
        Lead.countDocuments(leadFilter),
        Opportunity.countDocuments(oppFilter),
        Opportunity.countDocuments({ ...oppFilter, status: "Won" }),
        Opportunity.aggregate([
          { $match: { ...oppFilter } },
          {
            $group: {
              _id: "$stage",
              amount: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]),
        Lead.aggregate([
          { $match: leadFilter },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);
    return NextResponse.json({
      customers,
      leads,
      opportunities,
      won,
      pipeline,
      conversion,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unable to load reports." },
      { status: e.message === "UNAUTHORIZED" ? 401 : 500 },
    );
  }
}
