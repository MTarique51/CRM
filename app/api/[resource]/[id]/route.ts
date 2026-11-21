import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/security";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import {
  Customer,
  Lead,
  Opportunity,
  FollowUp,
  Activity,
  User,
} from "@/models";
import { requireUser, canAccess, audit, assertRole } from "@/lib/auth";
import { validatePayload, validatePassword } from "@/lib/validation";
import { validateReferences } from "@/lib/references";
const config: any = {
  customers: { model: Customer, owner: "owner" },
  leads: { model: Lead, owner: "owner" },
  opportunities: { model: Opportunity, owner: "owner" },
  followups: { model: FollowUp, owner: "assignedTo" },
  activities: { model: Activity, owner: "assignedTo" },
  users: { model: User, owner: null },
};
export async function GET(
  _req: Request,
  { params }: { params: { resource: string; id: string } },
) {
  try {
    const user = await requireUser(),
      cfg = config[params.resource];
    if (!cfg)
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (params.resource === "users" && user.role !== "Admin")
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    await connectDB();
    const item = await cfg.model
      .findById(params.id)
      .select(params.resource === "users" ? "-passwordHash" : "");
    if (!item)
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    if (cfg.owner && !(await canAccess(user, item[cfg.owner])))
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unable to load record." },
      { status: 500 },
    );
  }
}
export async function PUT(
  req: Request,
  { params }: { params: { resource: string; id: string } },
) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  try {
    const user = await requireUser(),
      cfg = config[params.resource];
    if (!cfg || (params.resource === "users" && user.role !== "Admin"))
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    await connectDB();
    const item = await cfg.model.findById(params.id);
    if (!item)
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    if (cfg.owner && !(await canAccess(user, item[cfg.owner])))
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const data = await req.json();
    if (params.resource === "customers" && data.email)
      data.email = String(data.email).trim().toLowerCase();
    if (data.email && params.resource === "leads")
      data.email = String(data.email).trim().toLowerCase();
    if (
      cfg.owner &&
      data[cfg.owner] &&
      String(data[cfg.owner]) !== String(item[cfg.owner]) &&
      !(await canAccess(user, data[cfg.owner]))
    )
      return NextResponse.json(
        { error: "You cannot assign records outside your team." },
        { status: 403 },
      );
    if (cfg.owner && user.role === "SalesExecutive") data[cfg.owner] = user.id;
    if (params.resource === "users" && data.password) {
      if (!validatePassword(data.password))
        return NextResponse.json(
          { error: "Password must be at least 8 characters." },
          { status: 400 },
        );
      data.passwordHash = await bcrypt.hash(data.password, 12);
      delete data.password;
    }
    if (
      params.resource === "leads" &&
      data.status === "Converted" &&
      item.status !== "Converted"
    )
      return NextResponse.json(
        { error: "Use the Convert action to convert a qualified lead." },
        { status: 400 },
      );
    if (params.resource === "opportunities" && data.stage)
      data.status =
        data.stage === "Won" ? "Won" : data.stage === "Lost" ? "Lost" : "Open";
    const referenceError = await validateReferences(params.resource, data);
    if (referenceError)
      return NextResponse.json({ error: referenceError }, { status: 400 });
    const errors = validatePayload(params.resource, data);
    if (errors.length)
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    const old = item.toObject();
    Object.assign(item, data);
    if (params.resource === "users") {
      delete item.password;
    }
    await item.save();
    const nextValue = item.toObject();
    if (params.resource === "users") {
      delete old.passwordHash;
      delete nextValue.passwordHash;
    }
    await audit(
      user,
      "UPDATE",
      params.resource,
      params.id,
      `${params.resource} record updated`,
      "Success",
      old,
      nextValue,
    );
    if (params.resource === "users") delete nextValue.passwordHash;
    return NextResponse.json({ item: nextValue });
  } catch (e: any) {
    return NextResponse.json(
      {
        error:
          e.code === 11000
            ? "A record with this unique value already exists."
            : "Unable to update record.",
      },
      { status: e.code === 11000 ? 409 : 500 },
    );
  }
}
export async function DELETE(
  _req: Request,
  { params }: { params: { resource: string; id: string } },
) {
  if (!sameOrigin(_req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  try {
    const user = await requireUser(),
      cfg = config[params.resource];
    if (!cfg || (params.resource === "users" && user.role !== "Admin"))
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    await connectDB();
    const item = await cfg.model.findById(params.id);
    if (!item)
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    if (cfg.owner && !(await canAccess(user, item[cfg.owner])))
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    if (params.resource === "customers") {
      item.status = "Inactive";
      await item.save();
    } else if (params.resource === "users") {
      item.isActive = false;
      await item.save();
    } else await item.deleteOne();
    await audit(
      user,
      "DELETE",
      params.resource,
      params.id,
      `${params.resource} record deactivated/deleted`,
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unable to delete record." },
      { status: 500 },
    );
  }
}
