import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { connectDB } from "./db";
import { User, AuditLog } from "@/models";
import type { SessionUser, Role } from "@/types";
const secret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? ""
    : "development-secret-change-this-before-deploying-123456");
if (!secret) throw new Error("JWT_SECRET is required in production.");
const key = new TextEncoder().encode(secret);
export async function createSession(user: any) {
  return new SignJWT({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    team: user.team,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}
export async function getSession(): Promise<SessionUser | null> {
  try {
    const token = cookies().get("acxiom_session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, key);
    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as Role,
      team: String(payload.team || "Sales"),
    };
  } catch {
    return null;
  }
}
export async function requireUser() {
  const user = await getSession();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
export async function canAccess(user: SessionUser, owner?: any) {
  if (user.role === "Admin") return true;
  if (String(owner?._id || owner || "") === user.id) return true;
  if (user.role === "Manager" && owner) {
    const recordOwner = await User.findById(owner).select("team");
    return !!recordOwner && recordOwner.team === user.team;
  }
  return false;
}
export async function getOwnerScope(user: SessionUser, field = "owner") {
  if (user.role === "Admin") return {};
  if (user.role === "SalesExecutive") return { [field]: user.id };
  const ids = await User.find({ team: user.team, isActive: true }).distinct(
    "_id",
  );
  return { [field]: { $in: ids } };
}
export async function audit(
  user: SessionUser | null,
  action: string,
  entityName = "Auth",
  recordId = "",
  details = "",
  result = "Success",
  oldValue?: any,
  newValue?: any,
) {
  try {
    await connectDB();
    await AuditLog.create({
      user: user?.id,
      userName: user?.name || "Unknown",
      action,
      entityName,
      recordId,
      details,
      result,
      oldValue,
      newValue,
    });
  } catch (e) {
    console.error("Audit write failed", e);
  }
}
export async function assertRole(user: SessionUser, roles: Role[]) {
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
}
