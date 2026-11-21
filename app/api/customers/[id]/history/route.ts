import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer, Lead, Opportunity, FollowUp, Activity } from "@/models";
import { requireUser, canAccess } from "@/lib/auth";
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    await connectDB();
    const customer = await Customer.findById(params.id);
    if (!customer)
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 },
      );
    if (!(await canAccess(user, customer.owner)))
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const [leads, opportunities, followups, activities] = await Promise.all([
      Lead.find({ $or: [{ email: customer.email }, { phone: customer.phone }] })
        .select("name status source createdAt")
        .sort({ createdAt: -1 }),
      Opportunity.find({ customer: customer._id })
        .select("name amount stage status expectedCloseDate")
        .sort({ createdAt: -1 }),
      FollowUp.find({ customer: customer._id })
        .select("subject date type status")
        .sort({ date: -1 }),
      Activity.find({ customer: customer._id })
        .select("subject date type status description")
        .sort({ date: -1 }),
    ]);
    return NextResponse.json({
      customer,
      history: { leads, opportunities, followups, activities },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unable to load customer history." },
      { status: e.message === "UNAUTHORIZED" ? 401 : 500 },
    );
  }
}
