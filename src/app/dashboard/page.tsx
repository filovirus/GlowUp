"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Suspense } from "react";

interface Review {
  id: string;
  author: string;
  email: string | null;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: string;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  reviews: Review[];
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<string | null>(null);
  const [showAddBiz, setShowAddBiz] = useState(false);
  const [newBizName, setNewBizName] = useState("");
  const [newBizDesc, setNewBizDesc] = useState("");
  const [newBizWeb, setNewBizWeb] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [addError, setAddError] = useState("");
  const [upgraded, setUpgraded] = useState(searchParams.get("upgraded") === "true");

  const loadBusinesses = useCallback(async () => {
    const res = await fetch("/api/businesses");
    if (res.ok) {
      const data = await res.json();
      setBusinesses(data);
      if (data.length > 0 && !selectedBiz) {
        setSelectedBiz(data[0].id);
      }
    }
  }, [selectedBiz]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      loadBusinesses();
      // Fetch user plan
      fetch("/api/account").then((r) => r.json()).then((data) => {
        if (data.plan) setPlan(data.plan);
      });
    }
  }, [status, router, loadBusinesses]);

  useEffect(() => {
    if (upgraded) {
      const timer = setTimeout(() => setUpgraded(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [upgraded]);

  async function addBusiness(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    const res = await fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBizName, description: newBizDesc, website: newBizWeb }),
    });
    if (res.ok) {
      const biz = await res.json();
      setBusinesses((prev) => [{ ...biz, reviews: [] }, ...prev]);
      setSelectedBiz(biz.id);
      setShowAddBiz(false);
      setNewBizName("");
      setNewBizDesc("");
      setNewBizWeb("");
    } else {
      const data = await res.json();
      setAddError(data.error || "Failed to add business");
    }
  }

  async function deleteBusiness(bizId: string) {
    if (!confirm("Delete this business and all its reviews? This cannot be undone.")) return;
    const res = await fetch(`/api/businesses/${bizId}`, { method: "DELETE" });
    if (res.ok) {
      setBusinesses((prev) => prev.filter((b) => b.id !== bizId));
      if (selectedBiz === bizId) {
        setSelectedBiz(businesses.length > 1 ? businesses.find((b) => b.id !== bizId)?.id || null : null);
      }
    }
  }

  async function toggleApprove(reviewId: string, approved: boolean) {
    await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    setBusinesses((prev) =>
      prev.map((b) => ({
        ...b,
        reviews: b.reviews.map((r) => (r.id === reviewId ? { ...r, approved } : r)),
      }))
    );
  }

  async function deleteReview(reviewId: string) {
    await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    setBusinesses((prev) =>
      prev.map((b) => ({
        ...b,
        reviews: b.reviews.filter((r) => r.id !== reviewId),
      }))
    );
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleUpgrade() {
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
  }

  async function handleManageBilling() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-black">Loading...</div>;
  }

  const currentBiz = businesses.find((b) => b.id === selectedBiz);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            GlowUp
          </Link>
          <div className="flex items-center gap-3">
            {plan === "pro" ? (
              <button onClick={handleManageBilling} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium hover:bg-purple-200">Pro</button>
            ) : plan === "free" ? (
              <button onClick={handleUpgrade} className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-medium hover:bg-purple-700">
                Upgrade to Pro
              </button>
            ) : null}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-sm text-black hover:text-purple-600"
              >
                {session?.user?.email}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      Account Settings
                    </Link>
                    {plan === "pro" && (
                      <button
                        onClick={() => { setShowDropdown(false); handleManageBilling(); }}
                        className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
                      >
                        Manage Billing
                      </button>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Upgrade success banner */}
        {upgraded && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-6 flex items-center justify-between">
            <span>Welcome to GlowUp Pro! You now have unlimited businesses and reviews.</span>
            <button onClick={() => setUpgraded(false)} className="text-green-700 hover:text-green-900 font-bold">×</button>
          </div>
        )}

        {/* Free tier banner */}
        {plan === "free" && businesses.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 text-black text-sm p-4 rounded-lg mb-6 flex items-center justify-between">
            <div>
              <strong>Free plan:</strong> 1 business, 10 reviews.{" "}
              <span className="text-black">Upgrade to Pro for unlimited businesses, unlimited reviews, and no GlowUp branding.</span>
            </div>
            <button onClick={handleUpgrade} className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 shrink-0 ml-4">
              Upgrade — $10/mo
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-black">Businesses</h2>
              <button
                onClick={() => { setShowAddBiz(true); setAddError(""); }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                + Add
              </button>
            </div>
            <div className="space-y-1">
              {businesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => setSelectedBiz(biz.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    selectedBiz === biz.id
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "text-black hover:bg-gray-100"
                  }`}
                >
                  {biz.name}
                  <span className="block text-xs text-gray-500">
                    {biz.reviews.length} review{biz.reviews.length !== 1 ? "s" : ""}
                    {plan === "free" && ` / 10`}
                  </span>
                </button>
              ))}
              {businesses.length === 0 && !showAddBiz && (
                <p className="text-sm text-black px-3">No businesses yet. Add one to get started!</p>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {showAddBiz && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="font-bold text-black mb-4">Add a business</h3>
                {addError && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-3">{addError}</div>
                )}
                <form onSubmit={addBusiness} className="space-y-3">
                  <input
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    placeholder="Business name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    value={newBizDesc}
                    onChange={(e) => setNewBizDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    value={newBizWeb}
                    onChange={(e) => setNewBizWeb(e.target.value)}
                    placeholder="Website URL (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                      Create
                    </button>
                    <button type="button" onClick={() => setShowAddBiz(false)} className="px-4 py-2 text-black hover:text-purple-600 text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {currentBiz && (
              <>
                {/* Share links */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-black">{currentBiz.name}</h3>
                    <button
                      onClick={() => deleteBusiness(currentBiz.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete business
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-black font-medium block mb-1">Review link (share with customers)</label>
                      <div className="flex gap-2">
                        <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm text-black overflow-x-auto">
                          {baseUrl}/r/{currentBiz.slug}
                        </code>
                        <button
                          onClick={() => copyToClipboard(`${baseUrl}/r/${currentBiz.slug}`, "link")}
                          className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100"
                        >
                          {copied === "link" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-black font-medium block mb-1">QR Code (print or display for customers to scan)</label>
                      <div className="flex items-center gap-4 mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/qr?url=${encodeURIComponent(`${baseUrl}/r/${currentBiz.slug}`)}`}
                          width={150}
                          height={150}
                          alt="QR Code"
                          className="border border-gray-200 rounded-lg p-2"
                        />
                        <div className="text-sm text-black">
                          <p className="mb-2">Customers scan this to leave a review.</p>
                          <a
                            href={`/api/qr?url=${encodeURIComponent(`${baseUrl}/r/${currentBiz.slug}`)}`}
                            download={`${currentBiz.slug}-qr.svg`}
                            className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100 inline-block"
                          >
                            Download QR Code
                          </a>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-black font-medium block mb-1">Embed code (paste on your website)</label>
                      <div className="flex gap-2">
                        <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm text-black overflow-x-auto">
                          {`<script src="${baseUrl}/api/widget?slug=${currentBiz.slug}"></script>`}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `<script src="${baseUrl}/api/widget?slug=${currentBiz.slug}"></script>`,
                              "embed"
                            )
                          }
                          className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100"
                        >
                          {copied === "embed" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-black">Reviews ({currentBiz.reviews.length}{plan === "free" ? " / 10" : ""})</h3>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-medium">
                        {currentBiz.reviews.filter((r) => r.approved).length} approved
                      </span>
                      <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded font-medium">
                        {currentBiz.reviews.filter((r) => !r.approved).length} pending
                      </span>
                    </div>
                  </div>

                  {plan === "free" && currentBiz.reviews.length >= 10 && (
                    <div className="bg-yellow-50 border border-yellow-200 text-black text-sm p-3 rounded-lg mb-4">
                      You&apos;ve reached the free plan limit of 10 reviews.{" "}
                      <button onClick={handleUpgrade} className="text-purple-600 font-medium hover:underline">
                        Upgrade to Pro
                      </button>{" "}
                      for unlimited reviews.
                    </div>
                  )}

                  {currentBiz.reviews.length === 0 ? (
                    <p className="text-black text-sm py-8 text-center">
                      No reviews yet. Share your review link to start collecting!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {currentBiz.reviews.map((review) => (
                        <div
                          key={review.id}
                          className={`border rounded-xl p-4 ${
                            review.approved ? "border-gray-200" : "border-yellow-300 bg-yellow-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-black">{review.author}</span>
                                <StarDisplay rating={review.rating} />
                                {!review.approved && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                                    Pending
                                  </span>
                                )}
                              </div>
                              <p className="text-black text-sm">{review.text}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(review.createdAt).toLocaleDateString()}
                                {review.email && ` · ${review.email}`}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0 ml-4">
                              <button
                                onClick={() => toggleApprove(review.id, !review.approved)}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  review.approved
                                    ? "text-yellow-700 hover:bg-yellow-50"
                                    : "text-green-700 hover:bg-green-50"
                                }`}
                              >
                                {review.approved ? "Hide" : "Approve"}
                              </button>
                              <button
                                onClick={() => deleteReview(review.id)}
                                className="px-2 py-1 rounded text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {!currentBiz && !showAddBiz && (
              <div className="text-center py-20 text-black">
                <p className="text-lg font-bold mb-2">Welcome to GlowUp!</p>
                <p>Add your first business to get started.</p>
                <button
                  onClick={() => setShowAddBiz(true)}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add a business
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-black">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
