import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Public: submit a review
export async function POST(req: NextRequest) {
  const { businessId, author, email, rating, text } = await req.json();

  if (!businessId || !author || !rating || !text) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: {
      businessId,
      author,
      email: email || null,
      rating,
      text,
    },
  });

  return NextResponse.json(review);
}
