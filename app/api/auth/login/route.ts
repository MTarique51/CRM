import { NextResponse } from "next/server";
import { sameOrigin, rateLimit } from "@/lib/security";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { createSession, audit } from "@/lib/auth";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.allowed)
    return NextResponse.json(
      { error: "Too many sign-in attempts. Try again later." },
      { status: 429 },
    );
  try {
    const { email, password } = await req.json();
    await connectDB();
    const user = await User.findOne({
      email: String(email || "").toLowerCase(),
    }).select("+passwordHash");
    if (!user) {
      await audit(
        null,
        "LOGIN_FAILED",
        "Auth",
        "",
        `Unknown account: ${String(email || "").slice(0, 120)}`,
        "Failed",
      );
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }
    if (user.lockoutUntil && user.lockoutUntil > Date.now())
      return NextResponse.json(
        {
          error: `Account temporarily locked. Try again after ${new Date(user.lockoutUntil).toLocaleTimeString()}.`,
        },
        { status: 423 },
      );
    if (!user.isActive)
      return NextResponse.json(
        { error: "This account is inactive. Contact your administrator." },
        { status: 403 },
      );
    const valid = await bcrypt.compare(password || "", user.passwordHash);
    if (!valid) {
      user.failedLoginCount = (user.failedLoginCount || 0) + 1;
      if (user.failedLoginCount >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.failedLoginCount = 0;
      }
      await user.save();
      await audit(
        {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        "LOGIN_FAILED",
        "Auth",
        String(user._id),
        "Invalid credentials",
        "Failed",
      );
      return NextResponse.json(
        {
          error: user.lockoutUntil
            ? "Too many failed attempts. Account locked for 15 minutes."
            : "Invalid email or password.",
        },
        { status: user.lockoutUntil ? 423 : 401 },
      );
    }
    user.failedLoginCount = 0;
    user.lockoutUntil = null;
    await user.save();
    const token = await createSession(user);
    await audit(
      {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      "LOGIN",
      "Auth",
      String(user._id),
      "Successful login",
    );
    const res = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    res.cookies.set("acxiom_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error:any) {
    console.log(error)
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
