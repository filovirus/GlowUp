import { prisma } from "@/lib/db";
import { hashSync } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashSync(password, 10),
      name: name || null,
    },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
