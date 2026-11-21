import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/security";
import { connectDB } from "@/lib/db";
import { Lead, Customer } from "@/models";
import { requireUser, canAccess, audit } from "@/lib/auth";
import { validateEmail, validatePhone } from "@/lib/validation";
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!sameOrigin(_req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  try {
    const user = await requireUser();
    await connectDB();
    const lead = await Lead.findById(params.id);
    if (!lead)
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    if (!(await canAccess(user, lead.owner)))
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    if (lead.status !== "Qualified")
      return NextResponse.json(
        { error: "Only qualified leads can be converted." },
        { status: 400 },
      );
    if (
      !lead.email ||
      !validateEmail(lead.email) ||
      !lead.phone ||
      !validatePhone(lead.phone)
    )
      return NextResponse.json(
        { error: "A valid email and phone are required before conversion." },
        { status: 400 },
      );
    const duplicate = await Customer.findOne({
      $or: [{ email: lead.email.toLowerCase() }, { phone: lead.phone }],
    });
    if (duplicate)
      return NextResponse.json(
        { error: "A customer with this email or phone already exists." },
        { status: 409 },
      );
    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: "Active",
      owner: lead.owner,
      createdBy: user.id,
      notes: `Converted from lead ${lead._id}`,
    });
    lead.status = "Converted";
    lead.convertedCustomer = customer._id;
    await lead.save();
    await audit(
      user,
      "CONVERT",
      "Lead",
      String(lead._id),
      `Lead converted to customer ${customer._id}`,
    );
    return NextResponse.json({ customer, lead }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unable to convert lead." },
      { status: 500 },
    );
  }
}
