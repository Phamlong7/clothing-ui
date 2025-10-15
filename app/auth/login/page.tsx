"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { login } from "@/lib/api";
import type { HttpError } from "@/lib/http";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login: setAuth } = useAuth();
  const { show } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { token } = await login(formData);
      setAuth(token);
      show("Login successful!", "success");
      router.push("/");
    } catch (error) {
      if (typeof error === "object" && error !== null && "kind" in error) {
        const err = error as HttpError;
        if (err.kind === "validation" && err.problem?.errors) {
          const first = Object.values(err.problem.errors)[0]?.[0];
          show(first || "Validation error", "error");
          return;
        }
        if (err.kind === "unauthorized") {
          show("Invalid email or password", "error");
          return;
        }
        if (err.kind === "problem" || err.kind === "unknown") {
          const cid = err.correlationId ? ` (CID: ${err.correlationId})` : "";
          show(`Login failed. Please try again.${cid}`, "error");
          return;
        }
      }
      show("Login failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/70">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-2xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70">
              Don&apos;t have an account?{" "}
              <a
                href="/auth/register"
                className="text-purple-300 hover:text-purple-200 font-semibold transition-colors duration-300"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
