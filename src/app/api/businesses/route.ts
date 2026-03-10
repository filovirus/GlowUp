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

  // Free tier: max 1 business
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.plan === "free") {
    const count = await prisma.business.count({ where: { userId: session.user.id } });
    if (count >= 1) {
      return NextResponse.json(
        { error: "Free plan allows 1 business. Upgrade to Pro for unlimited." },
        { status: 403 }
      );
    }
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
