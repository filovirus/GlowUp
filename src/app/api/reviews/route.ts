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

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { user: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Free tier: max 10 reviews per business
  if (business.user.plan === "free") {
    const reviewCount = await prisma.review.count({ where: { businessId } });
    if (reviewCount >= 10) {
      return NextResponse.json(
        { error: "This business has reached its review limit. The owner needs to upgrade to accept more reviews." },
        { status: 403 }
      );
    }
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
