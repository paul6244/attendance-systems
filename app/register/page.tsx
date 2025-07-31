// File: app/page.tsx (Registration Page)
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const API_URL = "http://10.186.22.175/attendance-api";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as string) || "admin";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    index_number: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/register.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, role }),
      });

      const result = await res.json();

      if (result.success) {
        router.push("/login");
      } else {
        setError(result.error || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Could not connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="shadow-xl bg-white rounded-lg p-6">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <Image
                src="/department-logo.png"
                alt="Department Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center capitalize mb-4">
            {role} Registration
          </h2>

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full p-2 border"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full p-2 border"
            />

            {role === "student" && (
              <input
                type="text"
                name="index_number"
                value={formData.index_number}
                onChange={handleChange}
                placeholder="Index Number"
                required
                className="w-full p-2 border"
              />
            )}

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full p-2 border"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
