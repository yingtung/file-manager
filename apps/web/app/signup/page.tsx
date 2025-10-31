"use client";

import { useState } from "react";
import Link from "next/link";
import React from "react";
import { signup } from "@/app/signup/actions";
import { Alert } from "@/components/alert";
import { getErrorMessage } from "@/utils/errors";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await signup({ email, password });
      
      if (result?.error) {
        setError(getErrorMessage(result));
        setLoading(false);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-[420px] w-full p-6">
        <h1 className="text-3xl font-semibold mb-4">Sign up</h1>
        {error && (
          <Alert
            variant="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-4"
          />
        )}
        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 px-2.5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-8 px-2.5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-3.5 py-2.5 rounded-md border border-black bg-black text-white font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-900 transition-colors"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-black underline hover:no-underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}


