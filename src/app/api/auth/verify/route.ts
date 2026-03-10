import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Email and code required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 400 });
  }

  if (user.verifyCode !== code) {
    return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
  }

  if (user.verifyExpires && user.verifyExpires < new Date()) {
    return NextResponse.json({ error: "Verification code expired. Please sign up again." }, { status: 400 });
  }

  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      verifyCode: null,
      verifyExpires: null,
    },
  });

  return NextResponse.json({ success: true });
}
