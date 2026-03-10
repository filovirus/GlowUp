import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { hashSync } from "bcryptjs";
import { NextResponse } from "next/server";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.emailVerified) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const code = generateCode();
  const verifyExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  if (existing && !existing.emailVerified) {
    // Update existing unverified user
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashSync(password, 10),
        name: name || null,
        verifyCode: code,
        verifyExpires,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash: hashSync(password, 10),
        name: name || null,
        verifyCode: code,
        verifyExpires,
      },
    });
  }

  await sendVerificationEmail(email, code);

  return NextResponse.json({ email });
}
