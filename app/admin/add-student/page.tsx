"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, Calendar, GraduationCap, Lock, Eye, EyeOff } from "lucide-react"
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

export default function AddStudentPage() {
  const [user, setUser] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    indexNumber: "",
    email: "",
    phone: "",
    department: "",
    academicLevel: "",
    programType: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    selectedClasses: [] as string[],
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

    // Load classes
    const classesData = JSON.parse(localStorage.getItem("classes") || "[]")
    setClasses(classesData)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    // Validate form
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.indexNumber ||
      !formData.email ||
      !formData.department ||
      !formData.academicLevel ||
      !formData.programType ||
      !formData.password
    ) {
      setMessage({ type: "error", text: "Please fill in all required fields including program type and password." })
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

      // Get existing students
      const existingStudents = JSON.parse(localStorage.getItem("students") || "[]")

      // Check if index number or email already exists
      const indexExists = existingStudents.some((s: any) => s.indexNumber === formData.indexNumber)
      const emailExists = existingStudents.some((s: any) => s.email === formData.email)

      if (indexExists) {
        setMessage({ type: "error", text: "Index number already exists. Please use a different one." })
        setIsSubmitting(false)
        return
      }

      if (emailExists) {
        setMessage({ type: "error", text: "Email already exists. Please use a different one." })
        setIsSubmitting(false)
        return
      }

      // Get selected classes info
      const selectedClassesInfo = classes.filter((c) => formData.selectedClasses.includes(c.id.toString()))

      // Create new student
      const newStudent = {
        id: Date.now(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        indexNumber: formData.indexNumber,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        departmentName: departments.find((d) => d.id === formData.department)?.name || "",
        academicLevel: formData.academicLevel,
        academicLevelName: academicLevels.find((l) => l.id === formData.academicLevel)?.name || "",
        programType: formData.programType,
        programTypeName: programTypes.find((p) => p.id === formData.programType)?.name || "",
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        password: formData.password,
        selectedClasses: formData.selectedClasses,
        classes: selectedClassesInfo.map((c) => ({
          id: c.id,
          name: c.className,
          code: c.classCode,
          teacher: c.teacherName,
        })),
        status: "active",
        attendanceRate: 0,
        totalSessions: 0,
        attendedSessions: 0,
        createdAt: new Date().toISOString(),
        createdBy: user.identifier,
        attendanceRecords: [],
        passwordCreatedBy: "admin",
      }

      // Save to localStorage
      const updatedStudents = [...existingStudents, newStudent]
      localStorage.setItem("students", JSON.stringify(updatedStudents))

      // Update class enrollment counts
      const updatedClasses = classes.map((c) => {
        if (formData.selectedClasses.includes(c.id.toString())) {
          return {
            ...c,
            currentStudents: (c.currentStudents || 0) + 1,
            students: [...(c.students || []), newStudent.id],
          }
        }
        return c
      })
      localStorage.setItem("classes", JSON.stringify(updatedClasses))

      setMessage({
        type: "success",
        text: `Student "${formData.firstName} ${formData.lastName}" created successfully! Index: ${formData.indexNumber}. Program: ${programTypes.find((p) => p.id === formData.programType)?.name}`,
      })

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        indexNumber: "",
        email: "",
        phone: "",
        department: "",
        academicLevel: "",
        programType: "",
        dateOfBirth: "",
        address: "",
        emergencyContact: "",
        emergencyPhone: "",
        selectedClasses: [],
        password: "",
        confirmPassword: "",
      })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create student account. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClassSelection = (classId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter((id) => id !== classId)
        : [...prev.selectedClasses, classId],
    }))
  }

  const filteredClasses = classes.filter((cls) => {
    if (!formData.department) return true

    // Filter classes based on department and program type
    const departmentMatch = cls.department === formData.department
    const programMatch = formData.programType ? cls.programType === formData.programType || !cls.programType : true

    return departmentMatch && programMatch
  })

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
              <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
              <p className="text-gray-600">Create a new student account with program classification</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Student Account</CardTitle>
            <CardDescription>
              Fill in the details to create a new student account with program classification
            </CardDescription>
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
                      placeholder="Alice"
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
                      placeholder="Johnson"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="indexNumber">Index Number *</Label>
                    <Input
                      id="indexNumber"
                      type="text"
                      placeholder="CS/2024/001"
                      value={formData.indexNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, indexNumber: e.target.value.toUpperCase() }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main Street, City, State"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="alice.johnson@student.edu"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      type="text"
                      placeholder="Parent/Guardian Name"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        placeholder="+1 (555) 987-6543"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, department: value, selectedClasses: [] }))
                      }
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

                  <div className="space-y-2">
                    <Label htmlFor="academicLevel">Academic Level *</Label>
                    <Select
                      value={formData.academicLevel}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, academicLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
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

                  <div className="space-y-2">
                    <Label htmlFor="programType">Program Type *</Label>
                    <Select
                      value={formData.programType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, programType: value, selectedClasses: [] }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
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
                </div>

                {/* Program Type Info */}
                {formData.programType && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">📚 Program Information:</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      {formData.programType === "regular" && (
                        <>
                          <p>
                            • <strong>Regular Program:</strong> Full-time day classes
                          </p>
                          <p>• Schedule: Monday - Friday, 8:00 AM - 4:00 PM</p>
                          <p>• Duration: 4-5 years depending on course</p>
                        </>
                      )}
                      {formData.programType === "evening" && (
                        <>
                          <p>
                            • <strong>Evening Program:</strong> Part-time evening classes
                          </p>
                          <p>• Schedule: Monday - Friday, 6:00 PM - 9:00 PM</p>
                          <p>• Duration: 5-6 years (extended timeline)</p>
                        </>
                      )}
                      {formData.programType === "diploma-evening" && (
                        <>
                          <p>
                            • <strong>Diploma Evening:</strong> Professional diploma program
                          </p>
                          <p>• Schedule: Monday - Friday, 6:00 PM - 9:00 PM</p>
                          <p>• Duration: 2-3 years diploma program</p>
                        </>
                      )}
                      {formData.programType === "weekend" && (
                        <>
                          <p>
                            • <strong>Weekend Program:</strong> Saturday and Sunday classes
                          </p>
                          <p>• Schedule: Saturday - Sunday, 8:00 AM - 5:00 PM</p>
                          <p>• Duration: 5-6 years (extended timeline)</p>
                        </>
                      )}
                      {formData.programType === "distance" && (
                        <>
                          <p>
                            • <strong>Distance Learning:</strong> Online and hybrid classes
                          </p>
                          <p>• Schedule: Flexible with periodic face-to-face sessions</p>
                          <p>• Duration: 4-6 years depending on pace</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Account Security</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password (min 6 chars)"
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

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">🔒 Password Requirements:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Minimum 6 characters long</li>
                    <li>• Student will use this password to login</li>
                    <li>• Keep this password secure and private</li>
                  </ul>
                </div>
              </div>

              {/* Class Enrollment */}
              {filteredClasses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Class Enrollment</h3>

                  <div className="space-y-2">
                    <Label>Select Classes (Optional)</Label>
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border rounded-md p-4">
                      {filteredClasses.map((classItem) => (
                        <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.selectedClasses.includes(classItem.id.toString())}
                              onChange={() => handleClassSelection(classItem.id.toString())}
                              className="rounded border-gray-300"
                            />
                            <div>
                              <p className="font-medium">{classItem.className}</p>
                              <p className="text-sm text-gray-600">
                                {classItem.classCode} • {classItem.teacherName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500">{classItem.schedule}</p>
                                {classItem.programType && (
                                  <Badge variant="outline" className="text-xs">
                                    {programTypes.find((p) => p.id === classItem.programType)?.name ||
                                      classItem.programType}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              {classItem.currentStudents || 0}/{classItem.maxStudents}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.selectedClasses.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        Selected Classes: {formData.selectedClasses.length}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.selectedClasses.map((classId) => {
                          const classItem = filteredClasses.find((c) => c.id.toString() === classId)
                          return (
                            <Badge key={classId} variant="default">
                              {classItem?.classCode}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {filteredClasses.length === 0 && formData.department && formData.programType && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertDescription className="text-yellow-800">
                    No classes found for the selected department and program type. Please add classes first or select a
                    different program type.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Student Account..." : "Create Student Account"}
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
