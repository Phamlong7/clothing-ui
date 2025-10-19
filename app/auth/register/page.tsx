"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { register, login } from "@/lib/api";
import type { HttpError } from "@/lib/http";
import { useToast } from "@/components/ToastProvider";
import ErrorAlert from "@/components/ErrorAlert";

export default function RegisterPage() {
  const router = useRouter();
  const { login: setAuth } = useAuth();
  const { show } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]); // Clear previous errors
    
    // Frontend validation
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = "Passwords do not match";
      setErrors([errorMsg]);
      show(errorMsg, "error");
      return;
    }

    if (formData.password.length < 6) {
      const errorMsg = "Password must be at least 6 characters";
      setErrors([errorMsg]);
      show(errorMsg, "error");
      return;
    }

    setIsLoading(true);

    try {
      await register({ email: formData.email, password: formData.password });
      show("Account created successfully! Signing you in...", "success");
      
      // Auto-login after registration
      const { token } = await login({ email: formData.email, password: formData.password });
      setAuth(token);
      router.push("/");
    } catch (error) {
      const errorMessages: string[] = [];

      if (typeof error === "object" && error !== null && "kind" in error) {
        const err = error as HttpError;

        // Handle validation errors (400 Bad Request)
        if (err.kind === "validation" && err.problem?.errors) {
          // Flatten errors from Record<string, string[]>
          const errorObj = err.problem.errors as Record<string, string[]>;
          for (const field in errorObj) {
            const fieldErrors = errorObj[field];
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(...fieldErrors);
            }
          }
        }
        // Handle other server errors
        else if (err.kind === "problem" || err.kind === "unknown") {
          errorMessages.push("Registration failed. Please try again.");
          if (err.correlationId) {
            errorMessages.push(`Error ID: ${err.correlationId}`);
          }
        }
      }

      // Fallback error
      if (errorMessages.length === 0) {
        errorMessages.push("Registration failed. Please try again.");
      }

      setErrors(errorMessages);
      
      // Show first error in toast for quick notification
      if (errorMessages.length > 0) {
        show(errorMessages[0], "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear errors when user starts typing
    setErrors([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/70">Join our clothing store</p>
          </div>

          {/* Error Alert */}
          {errors.length > 0 && (
            <ErrorAlert
              errors={errors}
              title="Registration Failed"
              onClose={() => setErrors([])}
            />
          )}

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
                placeholder="Enter your password (min. 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-2xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="text-purple-300 hover:text-purple-200 font-semibold transition-colors duration-300"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

