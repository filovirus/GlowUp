import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true, name: true, description: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(business);
}
