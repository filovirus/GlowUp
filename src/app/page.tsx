"use client";

import Link from "next/link";
import { useState } from "react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const fakeReviews = [
  { author: "Sarah M.", rating: 5, text: "Best coffee shop in town! The baristas always remember my order." },
  { author: "James L.", rating: 5, text: "Amazing service and the food is always fresh. Highly recommend!" },
  { author: "Maria K.", rating: 4, text: "Great atmosphere for working. WiFi is fast and staff is friendly." },
];

export default function Home() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          GlowUp
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition">
            Log in
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Turn happy customers into{" "}
          <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            your best marketing
          </span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          Collect reviews with a simple link. Display them on your website with one line of code. Watch your business grow.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3 bg-purple-600 text-white text-lg rounded-lg hover:bg-purple-700 transition shadow-lg shadow-purple-200"
          >
            Start collecting reviews
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">Free to start. No credit card required.</p>
      </section>

      {/* Demo Widget */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-lg font-semibold">Joe&apos;s Coffee Shop</div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="text-yellow-400">&#9733;</span> 4.7 (127 reviews)
            </div>
          </div>
          <div className="space-y-4">
            {fakeReviews.map((review, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{review.author}</span>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-gray-600">{review.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-xs text-gray-300">
            Powered by GlowUp
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create your page", desc: "Sign up and add your business. Get a unique review link in seconds." },
              { step: "2", title: "Share the link", desc: "Text or email the link to customers after a great experience." },
              { step: "3", title: "Embed & grow", desc: "Copy one line of code to display reviews on your website." },
            ].map((item, i) => (
              <div
                key={i}
                className={`text-center p-6 rounded-2xl transition-all duration-200 ${
                  hoveredStep === i ? "bg-white shadow-lg scale-105" : "bg-transparent"
                }`}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
          <p className="text-gray-500 mb-12">Start free, upgrade when you&apos;re ready.</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="border border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-semibold">Free</h3>
              <div className="mt-4 text-4xl font-bold">$0</div>
              <p className="text-gray-400 mt-1">forever</p>
              <ul className="mt-6 space-y-3 text-left text-gray-600">
                <li className="flex gap-2"><span className="text-green-500">&#10003;</span> 1 business</li>
                <li className="flex gap-2"><span className="text-green-500">&#10003;</span> 10 reviews</li>
                <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Basic embed widget</li>
                <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Review link</li>
              </ul>
              <Link href="/signup" className="mt-8 block w-full py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition text-center">
                Get started
              </Link>
            </div>
            <div className="border-2 border-purple-600 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                Popular
              </div>
              <h3 className="text-xl font-semibold">Pro</h3>
              <div className="mt-4 text-4xl font-bold">$10</div>
              <p className="text-gray-400 mt-1">/month</p>
              <ul className="mt-6 space-y-3 text-left text-gray-600">
                <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Unlimited businesses</li>
                <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Unlimited reviews</li>
                <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Custom widget styles</li>
                <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Remove GlowUp branding</li>
                <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Priority support</li>
              </ul>
              <Link href="/signup" className="mt-8 block w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-center">
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-sm text-gray-400">
          <div className="font-semibold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            GlowUp
          </div>
          <div>&copy; {new Date().getFullYear()} GlowUp. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
