"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, User, Lock, Mail, Building2, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function SetupAdmin() {
  const [isClient, setIsClient] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    identifier: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "Computer Science",
    institution: "KSTU",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [adminExists, setAdminExists] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    // Check if admin already exists
    const existingAdmin = localStorage.getItem("admin")
    if (existingAdmin) {
      setAdminExists(true)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
    setSuccess("")
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return false
    }
    if (!formData.identifier.trim()) {
      setError("Username/identifier is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const adminData = {
        id: Date.now(),
        fullName: formData.fullName,
        identifier: formData.identifier,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        institution: formData.institution,
        role: "super_admin",
        createdAt: new Date().toISOString(),
        status: "active",
      }

      // Save admin data
      localStorage.setItem("admin", JSON.stringify(adminData))

      setSuccess("Admin account created successfully! You can now login.")

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      setError("Failed to create admin account. Please try again.")
    }

    setIsLoading(false)
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the admin account? This will delete the existing admin.")) {
      localStorage.removeItem("admin")
      setAdminExists(false)
      setSuccess("Admin account reset successfully. You can now create a new admin account.")
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-6 pb-8">
            {/* KSTU Logo */}
            <div className="flex justify-center">
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src="/department-logo.png"
                  alt="KSTU Computer Science Students Association Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {adminExists ? "Admin Account Management" : "Setup Super Admin"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {adminExists
                  ? "An admin account already exists. You can reset it to create a new one."
                  : "Create your super administrator account for KSTU Attendance System"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {adminExists ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-800">
                    Admin account is already configured and ready to use.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Link href="/login">
                    <Button className="w-full" size="lg">
                      Go to Login
                    </Button>
                  </Link>

                  <Button onClick={handleReset} variant="destructive" className="w-full" size="lg">
                    Reset Admin Account
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identifier">Admin Username</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="identifier"
                        name="identifier"
                        type="text"
                        value={formData.identifier}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Choose a unique username"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="department"
                        name="department"
                        type="text"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Department name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="institution"
                        name="institution"
                        type="text"
                        value={formData.institution}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Institution name"
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
                        placeholder="Create a strong password"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Admin Account...
                      </div>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Create Super Admin
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}

            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Sign In Instead
                </Button>
              </Link>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <Link href="/" className="hover:underline">
                    ← Back to Home
                  </Link>
                </p>
                <p>
                  Need help?{" "}
                  <a href="mailto:support@kstu.edu.gh" className="hover:underline">
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
