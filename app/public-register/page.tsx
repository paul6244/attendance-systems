"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, User, Mail, Lock, Eye, EyeOff, GraduationCap } from "lucide-react"
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

const academicLevels = [
  { id: "100", name: "100 Level (First Year)" },
  { id: "200", name: "200 Level (Second Year)" },
  { id: "300", name: "300 Level (Third Year)" },
  { id: "400", name: "400 Level (Fourth Year)" },
  { id: "500", name: "500 Level (Fifth Year)" },
]

const programTypes = [
  { id: "regular", name: "Regular Program (Day)" },
  { id: "evening", name: "Evening Program" },
  { id: "diploma-evening", name: "Diploma Evening Program" },
  { id: "weekend", name: "Weekend Program" },
  { id: "distance", name: "Distance Learning" },
]

export default function PublicRegisterPage() {
  const [userType, setUserType] = useState<"student" | "teacher">("student")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    indexNumber: "", // For students
    username: "", // For teachers
    department: "",
    academicLevel: "", // For students
    programType: "", // For students
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.department
    ) {
      setMessage({ type: "error", text: "Please fill in all required fields." })
      setIsLoading(false)
      return
    }

    if (userType === "student" && (!formData.indexNumber || !formData.academicLevel || !formData.programType)) {
      setMessage({ type: "error", text: "Please enter your index number, academic level, and program type." })
      setIsLoading(false)
      return
    }

    if (userType === "teacher" && !formData.username) {
      setMessage({ type: "error", text: "Please enter a username." })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." })
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." })
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (userType === "student") {
        // Check if index number already exists
        const existingStudents = JSON.parse(localStorage.getItem("students") || "[]")
        if (existingStudents.some((s: any) => s.indexNumber === formData.indexNumber.toUpperCase())) {
          setMessage({ type: "error", text: "A student with this index number already exists." })
          setIsLoading(false)
          return
        }

        // Add new student
        const newStudent = {
          id: Date.now(),
          fullName: formData.fullName,
          indexNumber: formData.indexNumber.toUpperCase(),
          email: formData.email,
          department: formData.department,
          departmentName: departments.find((d) => d.id === formData.department)?.name || "",
          academicLevel: formData.academicLevel,
          academicLevelName: academicLevels.find((l) => l.id === formData.academicLevel)?.name || "",
          programType: formData.programType,
          programTypeName: programTypes.find((p) => p.id === formData.programType)?.name || "",
          password: formData.password,
          status: "active",
          attendanceRate: 0,
          totalSessions: 0,
          attendedSessions: 0,
          createdAt: new Date().toISOString(),
          createdBy: "self-registration",
          attendanceRecords: [],
        }

        const updatedStudents = [...existingStudents, newStudent]
        localStorage.setItem("students", JSON.stringify(updatedStudents))

        setMessage({
          type: "success",
          text: `Student account created successfully! Program: ${programTypes.find((p) => p.id === formData.programType)?.name}. You can now login.`,
        })
      } else {
        // Check if username already exists
        const existingTeachers = JSON.parse(localStorage.getItem("teachers") || "[]")
        if (existingTeachers.some((t: any) => t.username === formData.username)) {
          setMessage({ type: "error", text: "A teacher with this username already exists." })
          setIsLoading(false)
          return
        }

        // Add new teacher (pending approval)
        const newTeacher = {
          id: Date.now(),
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          department: formData.department,
          departmentName: departments.find((d) => d.id === formData.department)?.name || "",
          password: formData.password,
          status: "pending", // Teachers need admin approval
          createdAt: new Date().toISOString(),
          createdBy: "self-registration",
        }

        const updatedTeachers = [...existingTeachers, newTeacher]
        localStorage.setItem("teachers", JSON.stringify(updatedTeachers))

        setMessage({
          type: "success",
          text: "Teacher account created successfully! Your account is pending admin approval.",
        })
      }

      // Clear form
      setFormData({
        fullName: "",
        email: "",
        indexNumber: "",
        username: "",
        department: "",
        academicLevel: "",
        programType: "",
        password: "",
        confirmPassword: "",
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      setMessage({ type: "error", text: "Registration failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Join the attendance management system</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="userType">I am a:</Label>
              <Select value={userType} onValueChange={(value: "student" | "teacher") => setUserType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Student
                    </div>
                  </SelectItem>
                  <SelectItem value="teacher">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Teacher
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
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

            {/* Student-specific fields */}
            {userType === "student" && (
              <>
                {/* Index Number */}
                <div className="space-y-2">
                  <Label htmlFor="indexNumber">Index Number *</Label>
                  <Input
                    id="indexNumber"
                    type="text"
                    placeholder="e.g., CS/2024/001"
                    value={formData.indexNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, indexNumber: e.target.value.toUpperCase() }))}
                    required
                  />
                </div>

                {/* Academic Level */}
                <div className="space-y-2">
                  <Label htmlFor="academicLevel">Academic Level *</Label>
                  <Select
                    value={formData.academicLevel}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, academicLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Program Type */}
                <div className="space-y-2">
                  <Label htmlFor="programType">Program Type *</Label>
                  <Select
                    value={formData.programType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, programType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programTypes.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Program Info */}
                {formData.programType && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-700">
                      {formData.programType === "regular" && (
                        <p>
                          <strong>Regular Program:</strong> Full-time day classes (Mon-Fri, 8AM-4PM)
                        </p>
                      )}
                      {formData.programType === "evening" && (
                        <p>
                          <strong>Evening Program:</strong> Part-time evening classes (Mon-Fri, 6PM-9PM)
                        </p>
                      )}
                      {formData.programType === "diploma-evening" && (
                        <p>
                          <strong>Diploma Evening:</strong> Professional diploma program (Mon-Fri, 6PM-9PM)
                        </p>
                      )}
                      {formData.programType === "weekend" && (
                        <p>
                          <strong>Weekend Program:</strong> Saturday-Sunday classes (8AM-5PM)
                        </p>
                      )}
                      {formData.programType === "distance" && (
                        <p>
                          <strong>Distance Learning:</strong> Online and hybrid classes with flexible schedule
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Teacher-specific fields */}
            {userType === "teacher" && (
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10"
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
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

            {/* Login Credentials Info */}
            {userType === "student" && formData.indexNumber && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🔒 Your Login Credentials:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>
                    • <strong>Username:</strong> {formData.indexNumber}
                  </li>
                  <li>
                    • <strong>Password:</strong> The password you create here
                  </li>
                  <li>
                    • <strong>Program:</strong>{" "}
                    {programTypes.find((p) => p.id === formData.programType)?.name || "Select program type"}
                  </li>
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Message */}
            {message && (
              <Alert className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          {userType === "teacher" && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Teacher accounts require admin approval before you can access the system.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
