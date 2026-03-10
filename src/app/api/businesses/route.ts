import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businesses = await prisma.business.findMany({
    where: { userId: session.user.id },
    include: { reviews: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(businesses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, website } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Business name required" }, { status: 400 });
  }

  // Generate slug from name
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check uniqueness
  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const business = await prisma.business.create({
    data: {
      userId: session.user.id,
      name,
      slug,
      description: description || null,
      website: website || null,
    },
  });

  return NextResponse.json(business);
}
