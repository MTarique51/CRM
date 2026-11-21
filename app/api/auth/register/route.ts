import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/security";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { createSession, audit } from "@/lib/auth";
import { validatePassword } from "@/lib/validation";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  try {
    const { name, email, password } = await req.json();
    if (
      !name?.trim() ||
      !email ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !password ||
      !validatePassword(password)
    )
      return NextResponse.json(
        {
          error:
            "Enter a name, valid email and password with 8+ characters, uppercase, lowercase and a number.",
        },
        { status: 400 },
      );
    await connectDB();
    if (await User.findOne({ email: email.toLowerCase() }))
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    const count = await User.countDocuments();
    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: count === 0 ? "Admin" : "SalesExecutive",
    });
    const token = await createSession(user);
    await audit(
      {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      "REGISTER",
      "User",
      String(user._id),
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
  } catch (e) {
    return NextResponse.json(
      { error: "Unable to create account." },
      { status: 500 },
    );
  }
}
