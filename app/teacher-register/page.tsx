"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function TeacherRegister() {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    department: "",
    employeeId: "",
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    // Validation
    if (!formData.username || !formData.fullName || !formData.email || !formData.password) {
      setMessage({ type: "error", text: "Please fill in all required fields." })
      setIsSubmitting(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." })
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." })
      setIsSubmitting(false)
      return
    }

    try {
      // Check if teacher already exists
      const existingTeachers = JSON.parse(localStorage.getItem("teachers") || "[]")
      const existingTeacher = existingTeachers.find(
        (teacher: any) => teacher.username === formData.username || teacher.email === formData.email,
      )

      if (existingTeacher) {
        setMessage({ type: "error", text: "A teacher with this username or email already exists." })
        setIsSubmitting(false)
        return
      }

      // Create new teacher (pending approval)
      const newTeacher = {
        id: Date.now().toString(),
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        employeeId: formData.employeeId,
        password: formData.password,
        type: "teacher",
        status: "pending", // Requires admin approval
        registrationDate: new Date().toISOString(),
        assignedClasses: [],
      }

      // Save to localStorage
      const updatedTeachers = [...existingTeachers, newTeacher]
      localStorage.setItem("teachers", JSON.stringify(updatedTeachers))

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("teachersUpdated"))

      setMessage({
        type: "success",
        text: "Registration submitted successfully! Your account is pending admin approval. You will be notified once approved.",
      })

      // Reset form
      setFormData({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        department: "",
        employeeId: "",
        password: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Registration error:", error)
      setMessage({ type: "error", text: "Registration failed. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <Image
                src="/department-logo.png"
                alt="KSTU Computer Science Students Association Logo"
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder-logo.svg"
                }}
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
            Teacher Registration
          </CardTitle>
          <CardDescription>Create your teacher account to access the attendance system</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert
              className={`mb-4 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@kstu.edu.gh"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0712345678"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="computer-science">Computer Science</SelectItem>
                  <SelectItem value="information-technology">Information Technology</SelectItem>
                  <SelectItem value="software-engineering">Software Engineering</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                  <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="Enter your employee ID"
                value={formData.employeeId}
                onChange={(e) => handleInputChange("employeeId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting Application..." : "Submit Teacher Application"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Teacher accounts require admin approval. You will receive notification once your
              account is approved.
            </p>
          </div>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">Already have an account?</p>
            <Link href="/login">
              <Button variant="outline" className="w-full bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Are you a student?{" "}
              <Link href="/student-register" className="text-blue-600 hover:underline">
                Register as Student
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
