"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bug,
  User,
  Users,
  GraduationCap,
  Shield,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const credentials = [
  {
    type: "Student",
    icon: User,
    username: "Use your index number",
    password: "Use password you created",
    route: "/student-portal",
    color: "bg-blue-100 text-blue-600",
    badgeColor: "default" as const,
  },
  {
    type: "Teacher",
    icon: UserCheck,
    username: "Use your username",
    password: "Use password set by admin",
    route: "/teacher-dashboard",
    color: "bg-green-100 text-green-600",
    badgeColor: "secondary" as const,
  },
  {
    type: "Super Admin",
    icon: Shield,
    username: "superadmin (or custom)",
    password: "superadmin123 (or custom)",
    route: "/admin-dashboard",
    color: "bg-red-100 text-red-600",
    badgeColor: "destructive" as const,
  },
]

export default function DebugLogin() {
  const [isClient, setIsClient] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [copiedCredential, setCopiedCredential] = useState<string | null>(null)
  const [adminExists, setAdminExists] = useState(false)
  const [teachers, setTeachers] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    setIsClient(true)
    loadDebugData()
  }, [])

  const loadDebugData = () => {
    // Check admin
    const adminData = localStorage.getItem("admin")
    setAdminExists(!!adminData)

    // Load teachers and students
    const teachersData = JSON.parse(localStorage.getItem("teachers") || "[]")
    const studentsData = JSON.parse(localStorage.getItem("students") || "[]")

    setTeachers(teachersData.filter((t: any) => t.status === "active"))
    setStudents(studentsData.filter((s: any) => s.status === "active"))
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCredential(type)
      setTimeout(() => setCopiedCredential(null), 2000)
    })
  }

  const createSampleData = () => {
    // Create sample admin if doesn't exist
    if (!adminExists) {
      const sampleAdmin = {
        id: 1,
        fullName: "System Administrator",
        identifier: "admin",
        email: "admin@kstu.edu.gh",
        password: "admin123",
        department: "Computer Science",
        institution: "KSTU",
        role: "super_admin",
        createdAt: new Date().toISOString(),
        status: "active",
      }
      localStorage.setItem("admin", JSON.stringify(sampleAdmin))
    }

    // Create sample teacher
    const sampleTeacher = {
      id: Date.now(),
      fullName: "Dr. John Doe",
      username: "teacher1",
      email: "teacher@kstu.edu.gh",
      password: "teacher123",
      departmentName: "Computer Science",
      status: "active",
      createdAt: new Date().toISOString(),
    }

    // Create sample student
    const sampleStudent = {
      id: Date.now() + 1,
      fullName: "Jane Smith",
      indexNumber: "CS/2024/001",
      email: "student@kstu.edu.gh",
      password: "student123",
      departmentName: "Computer Science",
      academicLevel: "200",
      academicLevelName: "200 Level",
      programType: "regular",
      programTypeName: "Regular Program",
      status: "active",
      createdAt: new Date().toISOString(),
    }

    // Add to existing data
    const existingTeachers = JSON.parse(localStorage.getItem("teachers") || "[]")
    const existingStudents = JSON.parse(localStorage.getItem("students") || "[]")

    // Check if sample data already exists
    const teacherExists = existingTeachers.some((t: any) => t.username === "teacher1")
    const studentExists = existingStudents.some((s: any) => s.indexNumber === "CS/2024/001")

    if (!teacherExists) {
      existingTeachers.push(sampleTeacher)
      localStorage.setItem("teachers", JSON.stringify(existingTeachers))
    }

    if (!studentExists) {
      existingStudents.push(sampleStudent)
      localStorage.setItem("students", JSON.stringify(existingStudents))
    }

    // Reload data
    loadDebugData()
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading debug information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <Image
                src="/department-logo.png"
                alt="KSTU Computer Science Students Association Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug Login Credentials</h1>
          <p className="text-gray-600">Development and testing credentials for KSTU Attendance System</p>
          <Badge variant="destructive" className="mt-2">
            <Bug className="h-3 w-3 mr-1" />
            Development Only
          </Badge>
        </div>

        {/* Warning Alert */}
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-yellow-800">
            <strong>Warning:</strong> These are development credentials only. Do not use in production environment.
          </AlertDescription>
        </Alert>

        {/* Sample Data Creation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sample Data Management
            </CardTitle>
            <CardDescription>Create sample accounts for testing purposes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={createSampleData} className="w-full">
              Create Sample Accounts
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              This will create sample admin, teacher, and student accounts if they don't exist.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin Credentials */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Shield className="h-5 w-5" />
                Admin Account
              </CardTitle>
              <CardDescription>Super Administrator Access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {adminExists ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Username:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">admin</code>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard("admin", "admin-username")}>
                          {copiedCredential === "admin-username" ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Password:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {showPasswords ? "admin123" : "••••••••"}
                        </code>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard("admin123", "admin-password")}>
                          {copiedCredential === "admin-password" ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Badge variant="default" className="w-full justify-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Account Active
                  </Badge>
                </>
              ) : (
                <div className="text-center py-4">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">No admin account found</p>
                  <Link href="/setup-admin">
                    <Button size="sm" className="w-full">
                      Setup Admin Account
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teacher Credentials */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Users className="h-5 w-5" />
                Teacher Account
              </CardTitle>
              <CardDescription>Sample Teacher Access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teachers.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Username:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">teacher1</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard("teacher1", "teacher-username")}
                        >
                          {copiedCredential === "teacher-username" ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Password:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {showPasswords ? "teacher123" : "••••••••"}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard("teacher123", "teacher-password")}
                        >
                          {copiedCredential === "teacher-password" ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Badge variant="default" className="w-full justify-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {teachers.length} Active Teacher{teachers.length > 1 ? "s" : ""}
                  </Badge>
                </>
              ) : (
                <div className="text-center py-4">
                  <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">No active teachers found</p>
                  <Button size="sm" onClick={createSampleData} className="w-full">
                    Create Sample Teacher
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Credentials */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <GraduationCap className="h-5 w-5" />
                Student Account
              </CardTitle>
              <CardDescription>Sample Student Access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {students.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Index No:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">CS/2024/001</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard("CS/2024/001", "student-index")}
                        >
                          {copiedCredential === "student-index" ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Password:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {showPasswords ? "student123" : "••••••••"}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard("student123", "student-password")}
                        >
                          {copiedCredential === "student-password" ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Badge variant="default" className="w-full justify-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {students.length} Active Student{students.length > 1 ? "s" : ""}
                  </Badge>
                </>
              ) : (
                <div className="text-center py-4">
                  <GraduationCap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">No active students found</p>
                  <Button size="sm" onClick={createSampleData} className="w-full">
                    Create Sample Student
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => setShowPasswords(!showPasswords)} variant="outline" className="gap-2">
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPasswords ? "Hide" : "Show"} Passwords
          </Button>

          <Link href="/login">
            <Button className="gap-2">Go to Login Page</Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="gap-2 bg-transparent">
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>KSTU Computer Science Students Association - Attendance Management System</p>
          <p className="mt-1">Development Environment • Version 1.0</p>
        </div>
      </div>
    </div>
  )
}
