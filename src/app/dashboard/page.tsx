"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<string | null>(null);
  const [showAddBiz, setShowAddBiz] = useState(false);
  const [newBizName, setNewBizName] = useState("");
  const [newBizDesc, setNewBizDesc] = useState("");
  const [newBizWeb, setNewBizWeb] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

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
    if (status === "authenticated") loadBusinesses();
  }, [status, router, loadBusinesses]);

  async function addBusiness(e: React.FormEvent) {
    e.preventDefault();
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

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  const currentBiz = businesses.find((b) => b.id === selectedBiz);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            GlowUp
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{session?.user?.email}</span>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-gray-400 hover:text-gray-600">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">Businesses</h2>
              <button
                onClick={() => setShowAddBiz(true)}
                className="text-sm text-purple-600 hover:text-purple-700"
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
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {biz.name}
                  <span className="block text-xs text-gray-400">{biz.reviews.length} reviews</span>
                </button>
              ))}
              {businesses.length === 0 && !showAddBiz && (
                <p className="text-sm text-gray-400 px-3">No businesses yet. Add one to get started!</p>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {showAddBiz && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                <h3 className="font-semibold mb-4">Add a business</h3>
                <form onSubmit={addBusiness} className="space-y-3">
                  <input
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    placeholder="Business name"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    value={newBizDesc}
                    onChange={(e) => setNewBizDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    value={newBizWeb}
                    onChange={(e) => setNewBizWeb(e.target.value)}
                    placeholder="Website URL (optional)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                      Create
                    </button>
                    <button type="button" onClick={() => setShowAddBiz(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {currentBiz && (
              <>
                {/* Share links */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                  <h3 className="font-semibold mb-3">{currentBiz.name}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Review link (share with customers)</label>
                      <div className="flex gap-2">
                        <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600 overflow-x-auto">
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
                      <label className="text-xs text-gray-400 block mb-1">QR Code (print or display for customers to scan)</label>
                      <div className="flex items-center gap-4 mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/qr?url=${encodeURIComponent(`${baseUrl}/r/${currentBiz.slug}`)}`}
                          width={150}
                          height={150}
                          alt="QR Code"
                          className="border border-gray-100 rounded-lg p-2"
                        />
                        <div className="text-sm text-gray-500">
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
                      <label className="text-xs text-gray-400 block mb-1">Embed code (paste on your website)</label>
                      <div className="flex gap-2">
                        <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600 overflow-x-auto">
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
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Reviews ({currentBiz.reviews.length})</h3>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <span className="bg-green-50 text-green-600 px-2 py-1 rounded">
                        {currentBiz.reviews.filter((r) => r.approved).length} approved
                      </span>
                      <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded">
                        {currentBiz.reviews.filter((r) => !r.approved).length} pending
                      </span>
                    </div>
                  </div>

                  {currentBiz.reviews.length === 0 ? (
                    <p className="text-gray-400 text-sm py-8 text-center">
                      No reviews yet. Share your review link to start collecting!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {currentBiz.reviews.map((review) => (
                        <div
                          key={review.id}
                          className={`border rounded-xl p-4 ${
                            review.approved ? "border-gray-100" : "border-yellow-200 bg-yellow-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{review.author}</span>
                                <StarDisplay rating={review.rating} />
                                {!review.approved && (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                    Pending
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm">{review.text}</p>
                              <p className="text-xs text-gray-300 mt-1">
                                {new Date(review.createdAt).toLocaleDateString()}
                                {review.email && ` · ${review.email}`}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0 ml-4">
                              <button
                                onClick={() => toggleApprove(review.id, !review.approved)}
                                className={`px-2 py-1 rounded text-xs ${
                                  review.approved
                                    ? "text-yellow-600 hover:bg-yellow-50"
                                    : "text-green-600 hover:bg-green-50"
                                }`}
                              >
                                {review.approved ? "Hide" : "Approve"}
                              </button>
                              <button
                                onClick={() => deleteReview(review.id)}
                                className="px-2 py-1 rounded text-xs text-red-400 hover:bg-red-50 hover:text-red-600"
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
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg mb-2">Welcome to GlowUp!</p>
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
