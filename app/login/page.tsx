"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Lock, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function Login() {
  const [isClient, setIsClient] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    userType: "student",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminSetup, setIsAdminSetup] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    const adminData = localStorage.getItem("admin")
    setIsAdminSetup(!!adminData)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (formData.userType === "admin") {
        const adminData = localStorage.getItem("admin")
        if (!adminData) {
          setError("No admin account found. Please set up an admin account first.")
          setIsLoading(false)
          return
        }

        const admin = JSON.parse(adminData)
        if (
          (admin.username === formData.identifier || admin.email === formData.identifier) &&
          admin.password === formData.password
        ) {
          localStorage.setItem("user", JSON.stringify({ ...admin, type: "admin" }))
          router.push("/admin-dashboard")
        } else {
          setError("Invalid admin credentials")
        }
      } else if (formData.userType === "teacher") {
        const teachersData = JSON.parse(localStorage.getItem("teachers") || "[]")
        const teacher = teachersData.find(
          (t: any) =>
            (t.username === formData.identifier || t.email === formData.identifier) &&
            t.password === formData.password &&
            t.status === "active"
        )

        if (teacher) {
          localStorage.setItem("user", JSON.stringify({ ...teacher, type: "teacher" }))
          router.push("/teacher-dashboard")
        } else {
          setError("Invalid teacher credentials or account not approved")
        }
      } else {
        const studentsData = JSON.parse(localStorage.getItem("students") || "[]")
        const student = studentsData.find(
          (s: any) =>
            (s.indexNumber === formData.identifier || s.email === formData.identifier) &&
            s.password === formData.password &&
            s.status === "active"
        )

        if (student) {
          localStorage.setItem("user", JSON.stringify({ ...student, type: "student" }))
          router.push("/student-portal")
        } else {
          setError("Invalid student credentials")
        }
      }
    } catch (error) {
      setError("An error occurred during login")
    }

    setIsLoading(false)
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-6 pb-8">
            <div className="flex justify-center">
              <div className="relative w-20 h-20 mb-4">
                <Image
                  src="/department-logo.png"
                  alt="Department Logo"
                  fill
                  className="object-contain"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-logo.png"
                  }}
                />
              </div>
            </div>

            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">Attendance Management System</CardTitle>
              <CardDescription className="text-gray-600">Sign in to access your account</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!isAdminSetup && (
              <Alert className="border-blue-200 bg-blue-50">
                <Building2 className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  No admin account found.{" "}
                  <Link href="/setup-admin" className="font-medium underline hover:no-underline">
                    Set up admin account
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userType">Login as</Label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {formData.userType === "student"
                    ? "Index Number or Email"
                    : formData.userType === "teacher"
                    ? "Username or Email"
                    : "Admin Username or Email"}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder={
                      formData.userType === "student"
                        ? "Enter your index number or email"
                        : formData.userType === "teacher"
                        ? "Enter your username or email"
                        : "Enter admin username or email"
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New to the system?</span>
                </div>
              </div>

              <Link href="/public-register">
                <Button variant="outline" className="w-full bg-transparent">
                  Create Account
                </Button>
              </Link>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <Link href="/debug-login" className="hover:underline">
                    Debug Login (Development)
                  </Link>
                </p>
                <p>
                  Need help?{" "}
                  <a href="mailto:support@university.edu" className="hover:underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
