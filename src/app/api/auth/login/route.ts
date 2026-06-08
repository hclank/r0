import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, generateToken } from "@/lib/auth";
import { authSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsedData = authSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = parsedData.data;
    const user_records = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const user = user_records[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const is_password_valid = await verifyPassword(password, user.passwordHash);
    if (!is_password_valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = generateToken({
      userId: user.id,
      role: user.role as "user" | "admin",
    });

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
