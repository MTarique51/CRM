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
  AuditLog,
  User,
} from "@/models";
import {
  requireUser,
  canAccess,
  audit,
  assertRole,
  getOwnerScope,
} from "@/lib/auth";
import { validatePayload, validatePassword } from "@/lib/validation";
import { validateReferences } from "@/lib/references";
const config: any = {
  customers: {
    model: Customer,
    owner: "owner",
    roles: ["Admin", "Manager", "SalesExecutive"],
  },
  leads: {
    model: Lead,
    owner: "owner",
    roles: ["Admin", "Manager", "SalesExecutive"],
  },
  opportunities: {
    model: Opportunity,
    owner: "owner",
    roles: ["Admin", "Manager", "SalesExecutive"],
  },
  followups: {
    model: FollowUp,
    owner: "assignedTo",
    roles: ["Admin", "Manager", "SalesExecutive"],
  },
  activities: {
    model: Activity,
    owner: "assignedTo",
    roles: ["Admin", "Manager", "SalesExecutive"],
  },
  users: { model: User, owner: null, roles: ["Admin"] },
  audit: { model: AuditLog, owner: null, roles: ["Admin"] },
};
export async function GET(
  req: Request,
  { params }: { params: { resource: string } },
) {
  try {
    const user = await requireUser();
    const resource = params.resource;
    const cfg = config[resource];
    if (!cfg)
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 },
      );
    await assertRole(user, cfg.roles);
    await connectDB();
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const status = url.searchParams.get("status");
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("limit") || 50)),
    );
    const filter: any = {};
    if (cfg.owner) Object.assign(filter, await getOwnerScope(user, cfg.owner));
    if (status) filter.status = status;
    if (q) {
      const fields =
        resource === "customers"
          ? ["name", "email", "phone", "company"]
          : resource === "leads"
            ? ["name", "company", "email", "phone"]
            : resource === "opportunities"
              ? ["name", "stage"]
              : resource === "followups"
                ? ["subject", "type"]
                : resource === "activities"
                  ? ["subject", "type"]
                  : resource === "audit"
                    ? ["userName", "action", "entityName"]
                    : ["name", "email"];
      filter.$or = fields.map((f: string) => ({
        [f]: { $regex: q, $options: "i" },
      }));
    }
    let query = cfg.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    if (
      [
        "customers",
        "leads",
        "opportunities",
        "followups",
        "activities",
      ].includes(resource)
    )
      query = query.populate(
        resource === "followups"
          ? ["assignedTo", "customer", "lead", "opportunity"]
          : resource === "activities"
            ? ["assignedTo", "customer", "lead"]
            : ["owner"],
      );
    if (resource === "users")
      query = cfg.model
        .find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const [items, total] = await Promise.all([
      query,
      cfg.model.countDocuments(filter),
    ]);
    return NextResponse.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error:
          e.message === "UNAUTHORIZED"
            ? "Authentication required."
            : e.message === "FORBIDDEN"
              ? "You do not have permission."
              : "Unable to load records.",
      },
      {
        status:
          e.message === "UNAUTHORIZED"
            ? 401
            : e.message === "FORBIDDEN"
              ? 403
              : 500,
      },
    );
  }
}
export async function POST(
  req: Request,
  { params }: { params: { resource: string } },
) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  try {
    const user = await requireUser();
    const resource = params.resource,
      cfg = config[resource];
    if (!cfg || resource === "audit")
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 },
      );
    await assertRole(user, cfg.roles);
    if (resource === "users" && user.role !== "Admin")
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const data = await req.json();
    if (resource === "customers" && data.email)
      data.email = String(data.email).trim().toLowerCase();
    if (data.email && resource === "leads")
      data.email = String(data.email).trim().toLowerCase();
    const errors = validatePayload(resource, data);
    if (errors.length)
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    await connectDB();
    const referenceError = await validateReferences(resource, data);
    if (referenceError)
      return NextResponse.json({ error: referenceError }, { status: 400 });
    if (resource === "customers") {
      const duplicate = await Customer.findOne({
        $or: [{ email: data.email.toLowerCase() }, { phone: data.phone }],
      });
      if (duplicate)
        return NextResponse.json(
          { error: "A customer with this email or phone already exists." },
          { status: 409 },
        );
    }
    if (resource === "users") {
      if (
        !data.name ||
        !data.email ||
        !data.password ||
        !validatePassword(data.password)
      )
        return NextResponse.json(
          {
            error:
              "Name, email and password with 8+ characters, uppercase, lowercase and a number is required.",
          },
          { status: 400 },
        );
      data.passwordHash = await bcrypt.hash(data.password, 12);
      delete data.password;
    }
    if (cfg.owner && user.role === "SalesExecutive") data[cfg.owner] = user.id;
    else if (cfg.owner && !data[cfg.owner]) data[cfg.owner] = user.id;
    else if (cfg.owner && !(await canAccess(user, data[cfg.owner])))
      return NextResponse.json(
        { error: "You cannot assign records outside your team." },
        { status: 403 },
      );
    if (resource === "opportunities" && data.stage) {
      data.status =
        data.stage === "Won" ? "Won" : data.stage === "Lost" ? "Lost" : "Open";
    }
    if (resource === "opportunities" && Number(data.amount) <= 0)
      return NextResponse.json(
        { error: "Opportunity Amount must be greater than 0." },
        { status: 400 },
      );
    const created = await cfg.model.create({ ...data, createdBy: user.id });
    await audit(
      user,
      "CREATE",
      resource,
      String(created._id),
      `${resource} record created`,
    );
    const output = created.toObject();
    if (resource === "users") delete output.passwordHash;
    return NextResponse.json({ item: output }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      {
        error:
          e.message === "UNAUTHORIZED"
            ? "Authentication required."
            : e.message === "FORBIDDEN"
              ? "You do not have permission."
              : e.code === 11000
                ? "A record with this unique value already exists."
                : "Unable to create record.",
      },
      {
        status:
          e.message === "UNAUTHORIZED"
            ? 401
            : e.message === "FORBIDDEN"
              ? 403
              : 500,
      },
    );
  }
}
