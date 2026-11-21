import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/security";
import { getSession, audit } from "@/lib/auth";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const user = await getSession();
  await audit(user, "LOGOUT", "Auth", user?.id || "", "User logged out");
  const res = NextResponse.json({ ok: true });
  res.cookies.set("acxiom_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
