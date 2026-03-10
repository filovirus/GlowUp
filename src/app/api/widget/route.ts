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
      user: { select: { plan: true } },
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

  const isPro = business.user.plan === "pro";
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
  var isPro = ${isPro};

  function stars(n) {
    var s = '';
    for (var i = 1; i <= 5; i++) {
      s += '<span style="color:' + (i <= n ? '#facc15' : '#e5e7eb') + ';font-size:18px;">&#9733;</span>';
    }
    return s;
  }

  function initials(name) {
    return name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
  }

  var colors = ['#7c3aed','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444'];

  var html = '<div style="font-family:-apple-system,BlinkMacSystemFont,\\'Segoe UI\\',sans-serif;max-width:520px;border:1px solid #e5e7eb;border-radius:20px;padding:28px;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,0.06);">';

  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f3f4f6;">';
  html += '<div style="display:flex;align-items:center;gap:4px;">';
  html += '<span style="color:#facc15;font-size:22px;">&#9733;</span>';
  html += '<span style="font-size:24px;font-weight:700;color:#111;">' + avg + '</span>';
  html += '</div>';
  html += '<div style="font-size:14px;color:#6b7280;">' + count + ' review' + (count !== 1 ? 's' : '') + ' for <strong style="color:#111;">' + bizName + '</strong></div>';
  html += '</div>';

  reviews.forEach(function(r, idx) {
    var color = colors[idx % colors.length];
    html += '<div style="padding:16px 0;' + (idx < reviews.length - 1 ? 'border-bottom:1px solid #f3f4f6;' : '') + '">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">';
    html += '<div style="width:36px;height:36px;border-radius:50%;background:' + color + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;">' + initials(r.author) + '</div>';
    html += '<div>';
    html += '<div style="font-weight:600;font-size:14px;color:#111;">' + r.author + '</div>';
    html += '<div style="display:flex;align-items:center;gap:6px;">' + stars(r.rating) + '<span style="font-size:12px;color:#9ca3af;">' + r.date + '</span></div>';
    html += '</div>';
    html += '</div>';
    html += '<p style="color:#374151;font-size:14px;line-height:1.5;margin:0 0 0 46px;">' + r.text + '</p>';
    html += '</div>';
  });

  if (count === 0) {
    html += '<p style="color:#9ca3af;text-align:center;padding:24px 0;font-size:14px;">No reviews yet.</p>';
  }

  if (!isPro) {
    html += '<div style="text-align:center;margin-top:16px;padding-top:12px;border-top:1px solid #f3f4f6;font-size:12px;color:#c4b5fd;">';
    html += '<a href="https://glow-up-navy.vercel.app" target="_blank" style="color:#a78bfa;text-decoration:none;">Powered by GlowUp</a>';
    html += '</div>';
  }

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
