"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Lock, Eye, EyeOff, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ChangePasswordPage() {
  const [user, setUser] = useState<any>(null)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // Validation
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setMessage({ type: "error", text: "Please fill in all fields." })
      setIsLoading(false)
      return
    }

    if (passwords.new.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long." })
      setIsLoading(false)
      return
    }

    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "New passwords do not match." })
      setIsLoading(false)
      return
    }

    if (passwords.current === passwords.new) {
      setMessage({ type: "error", text: "New password must be different from current password." })
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Verify current password and update
      if (user.type === "student") {
        const students = JSON.parse(localStorage.getItem("students") || "[]")
        const studentIndex = students.findIndex((s: any) => s.id === user.id)

        if (studentIndex === -1 || students[studentIndex].password !== passwords.current) {
          setMessage({ type: "error", text: "Current password is incorrect." })
          setIsLoading(false)
          return
        }

        // Update password
        students[studentIndex].password = passwords.new
        students[studentIndex].passwordChangedAt = new Date().toISOString()
        localStorage.setItem("students", JSON.stringify(students))
      } else if (user.type === "teacher") {
        const teachers = JSON.parse(localStorage.getItem("teachers") || "[]")
        const teacherIndex = teachers.findIndex((t: any) => t.id === user.id)

        if (teacherIndex === -1 || teachers[teacherIndex].password !== passwords.current) {
          setMessage({ type: "error", text: "Current password is incorrect." })
          setIsLoading(false)
          return
        }

        // Update password
        teachers[teacherIndex].password = passwords.new
        teachers[teacherIndex].passwordChangedAt = new Date().toISOString()
        localStorage.setItem("teachers", JSON.stringify(teachers))
      } else if (user.type === "admin") {
        // Handle admin password change
        const adminCredentials = localStorage.getItem("adminCredentials")
        if (adminCredentials) {
          const admin = JSON.parse(adminCredentials)
          if (admin.password !== passwords.current) {
            setMessage({ type: "error", text: "Current password is incorrect." })
            setIsLoading(false)
            return
          }

          // Update admin password
          admin.password = passwords.new
          admin.passwordChangedAt = new Date().toISOString()
          localStorage.setItem("adminCredentials", JSON.stringify(admin))
        } else {
          // Default admin
          if (passwords.current !== "superadmin123") {
            setMessage({ type: "error", text: "Current password is incorrect." })
            setIsLoading(false)
            return
          }
          // Note: In a real app, you'd update the default admin password in the database
        }
      }

      setMessage({ type: "success", text: "Password changed successfully!" })

      // Clear form
      setPasswords({
        current: "",
        new: "",
        confirm: "",
      })

      // Redirect after 3 seconds
      setTimeout(() => {
        switch (user.type) {
          case "student":
            router.push("/student-portal")
            break
          case "teacher":
            router.push("/teacher-dashboard")
            break
          case "admin":
            router.push("/admin-dashboard")
            break
        }
      }, 3000)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to change password. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const getBackLink = () => {
    switch (user?.type) {
      case "student":
        return "/student-portal"
      case "teacher":
        return "/teacher-dashboard"
      case "admin":
        return "/admin-dashboard"
      default:
        return "/login"
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="current"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={passwords.current}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="new"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter your new password (min. 6 characters)"
                  value={passwords.new}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirm"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• At least 6 characters long</li>
                <li>• Different from your current password</li>
                <li>• Must match confirmation password</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>

            {/* Message */}
            {message && (
              <Alert
                className={`${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
              >
                <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
          </form>

          <div className="mt-6 text-center">
            <Link href={getBackLink()}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
