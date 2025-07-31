"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, UserPlus, Mail, Phone, User, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const departments = [
  { id: "cs", name: "Computer Science" },
  { id: "ee", name: "Electrical Engineering" },
  { id: "me", name: "Mechanical Engineering" },
  { id: "ce", name: "Civil Engineering" },
  { id: "math", name: "Mathematics" },
  { id: "physics", name: "Physics" },
]

export default function AddTeacherPage() {
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    password: "",
    confirmPassword: "",
    employeeId: "",
    qualification: "",
    specialization: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.type !== "admin") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    // Validate form
    if (
      !formData.username ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.department ||
      !formData.password ||
      !formData.employeeId
    ) {
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
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Get existing teachers
      const existingTeachers = JSON.parse(localStorage.getItem("teachers") || "[]")

      // Check if username or employee ID already exists
      const usernameExists = existingTeachers.some((t: any) => t.username === formData.username)
      const employeeIdExists = existingTeachers.some((t: any) => t.employeeId === formData.employeeId)

      if (usernameExists) {
        setMessage({ type: "error", text: "Username already exists. Please choose a different one." })
        setIsSubmitting(false)
        return
      }

      if (employeeIdExists) {
        setMessage({ type: "error", text: "Employee ID already exists. Please use a different one." })
        setIsSubmitting(false)
        return
      }

      // Create new teacher
      const newTeacher = {
        id: Date.now(),
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        departmentName: departments.find((d) => d.id === formData.department)?.name || "",
        password: formData.password, // Store the teacher's chosen password
        employeeId: formData.employeeId,
        qualification: formData.qualification,
        specialization: formData.specialization,
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: user.identifier,
        classes: [],
        studentsCount: 0,
        passwordCreatedBy: "teacher", // Track who created the password
      }

      // Save to localStorage
      const updatedTeachers = [...existingTeachers, newTeacher]
      localStorage.setItem("teachers", JSON.stringify(updatedTeachers))

      setMessage({
        type: "success",
        text: `Teacher account created successfully! Username: ${formData.username}. The teacher can now login with their chosen password.`,
      })

      // Reset form
      setFormData({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        password: "",
        confirmPassword: "",
        employeeId: "",
        qualification: "",
        specialization: "",
      })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create teacher account. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <Link href="/admin-dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Teacher</h1>
              <p className="text-gray-600">Create a new teacher account</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Teacher Account</CardTitle>
            <CardDescription>Fill in the details to create a new teacher account</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID *</Label>
                    <Input
                      id="employeeId"
                      type="text"
                      placeholder="EMP001"
                      value={formData.employeeId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, employeeId: e.target.value.toUpperCase() }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      type="text"
                      placeholder="Ph.D, M.Sc, etc."
                      value={formData.qualification}
                      onChange={(e) => setFormData((prev) => ({ ...prev, qualification: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    type="text"
                    placeholder="Machine Learning, Database Systems, etc."
                    value={formData.specialization}
                    onChange={(e) => setFormData((prev) => ({ ...prev, specialization: e.target.value }))}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.smith@university.edu"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Department */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Department Assignment</h3>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Account Security</h3>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="dr.smith"
                      value={formData.username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value.toLowerCase() }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password (min 6 chars)"
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
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
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 pr-10"
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
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Teacher Account..." : "Create Teacher Account"}
                </Button>
                <Link href="/admin-dashboard">
                  <Button type="button" variant="outline" className="bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </div>

              {/* Message */}
              {message && (
                <Alert
                  className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}
                >
                  <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
