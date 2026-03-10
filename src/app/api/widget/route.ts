import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return new NextResponse("// GlowUp: slug parameter required", {
      headers: { "Content-Type": "application/javascript" },
    });
  }

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!business) {
    return new NextResponse("// GlowUp: business not found", {
      headers: { "Content-Type": "application/javascript" },
    });
  }

  const avgRating =
    business.reviews.length > 0
      ? (business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length).toFixed(1)
      : "0";

  const reviewsJson = JSON.stringify(
    business.reviews.map((r) => ({
      author: r.author,
      rating: r.rating,
      text: r.text,
      date: r.createdAt.toISOString().split("T")[0],
    }))
  );

  const script = `
(function() {
  var reviews = ${reviewsJson};
  var bizName = ${JSON.stringify(business.name)};
  var avg = ${avgRating};
  var count = reviews.length;

  function stars(n) {
    var s = '';
    for (var i = 1; i <= 5; i++) {
      s += '<span style="color:' + (i <= n ? '#facc15' : '#e5e7eb') + ';font-size:16px;">&#9733;</span>';
    }
    return s;
  }

  var html = '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:500px;border:1px solid #e5e7eb;border-radius:16px;padding:24px;background:#fff;">';
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">';
  html += '<strong style="font-size:16px;">' + bizName + '</strong>';
  html += '<span style="color:#facc15;">&#9733;</span>';
  html += '<span style="font-size:14px;color:#6b7280;">' + avg + ' (' + count + ' reviews)</span>';
  html += '</div>';

  reviews.forEach(function(r) {
    html += '<div style="border:1px solid #f3f4f6;border-radius:12px;padding:12px;margin-bottom:8px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
    html += '<strong style="font-size:14px;">' + r.author + '</strong>';
    html += stars(r.rating);
    html += '</div>';
    html += '<p style="color:#4b5563;font-size:14px;margin:0;">' + r.text + '</p>';
    html += '</div>';
  });

  if (count === 0) {
    html += '<p style="color:#9ca3af;text-align:center;padding:16px 0;">No reviews yet.</p>';
  }

  html += '<div style="text-align:center;margin-top:12px;font-size:11px;color:#d1d5db;">Powered by GlowUp</div>';
  html += '</div>';

  document.currentScript.insertAdjacentHTML('afterend', html);
})();
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=300",
    },
  });
}
