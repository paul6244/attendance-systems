"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, GraduationCap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function StudentRegister() {
  const [formData, setFormData] = useState({
    indexNumber: "",
    fullName: "",
    email: "",
    phone: "",
    academicLevel: "",
    programType: "",
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
    if (!formData.indexNumber || !formData.fullName || !formData.email || !formData.password) {
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
      // Check if student already exists
      const existingStudents = JSON.parse(localStorage.getItem("students") || "[]")
      const existingStudent = existingStudents.find(
        (student: any) => student.indexNumber === formData.indexNumber || student.email === formData.email,
      )

      if (existingStudent) {
        setMessage({ type: "error", text: "A student with this index number or email already exists." })
        setIsSubmitting(false)
        return
      }

      // Create new student
      const newStudent = {
        id: Date.now().toString(),
        indexNumber: formData.indexNumber,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        academicLevel: formData.academicLevel,
        programType: formData.programType,
        password: formData.password,
        type: "student",
        status: "active",
        registrationDate: new Date().toISOString(),
        enrolledClasses: [],
      }

      // Save to localStorage
      const updatedStudents = [...existingStudents, newStudent]
      localStorage.setItem("students", JSON.stringify(updatedStudents))

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("studentsUpdated"))

      setMessage({
        type: "success",
        text: "Registration successful! You can now log in with your index number and password.",
      })

      // Reset form
      setFormData({
        indexNumber: "",
        fullName: "",
        email: "",
        phone: "",
        academicLevel: "",
        programType: "",
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
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
            <GraduationCap className="h-6 w-6 text-green-600" />
            Student Registration
          </CardTitle>
          <CardDescription>Create your student account to access the attendance system</CardDescription>
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
              <Label htmlFor="indexNumber">Index Number *</Label>
              <Input
                id="indexNumber"
                type="text"
                placeholder="e.g., CS/2024/001"
                value={formData.indexNumber}
                onChange={(e) => handleInputChange("indexNumber", e.target.value)}
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
                placeholder="your.email@example.com"
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
              <Label htmlFor="academicLevel">Academic Level</Label>
              <Select
                value={formData.academicLevel}
                onValueChange={(value) => handleInputChange("academicLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your academic level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="level1">Level 1</SelectItem>
                  <SelectItem value="level2">Level 2</SelectItem>
                  <SelectItem value="level3">Level 3</SelectItem>
                  <SelectItem value="level4">Level 4</SelectItem>
                  <SelectItem value="masters">Masters</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="programType">Program Type</Label>
              <Select value={formData.programType} onValueChange={(value) => handleInputChange("programType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your program type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulltime">Full Time</SelectItem>
                  <SelectItem value="parttime">Part Time</SelectItem>
                  <SelectItem value="distance">Distance Learning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
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
              {isSubmitting ? "Creating Account..." : "Create Student Account"}
            </Button>
          </form>

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
              Are you a teacher?{" "}
              <Link href="/teacher-register" className="text-blue-600 hover:underline">
                Register as Teacher
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
