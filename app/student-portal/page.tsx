"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LogOut, User, Calendar, BookOpen, TrendingUp, CheckCircle, XCircle, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function StudentPortal() {
  const [user, setUser] = useState<any>(null)
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.type !== "student") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    loadStudentData(parsedUser)
  }, [router])

  const loadStudentData = (studentUser: any) => {
    try {
      // Get all students from localStorage
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]")
      const studentData = allStudents.find(
        (s: any) =>
          s.indexNumber === studentUser.identifier || s.email === studentUser.email || s.id === studentUser.id,
      )

      if (!studentData) {
        // Create a default student record if not found
        const defaultStudent = {
          id: studentUser.id || Date.now(),
          name: studentUser.fullName || studentUser.identifier,
          indexNumber: studentUser.identifier,
          email: studentUser.email || `${studentUser.identifier}@university.edu`,
          department: "Computer Science",
          academicLevel: "Undergraduate",
          classes: [],
        }

        // Add to localStorage
        const updatedStudents = [...allStudents, defaultStudent]
        localStorage.setItem("students", JSON.stringify(updatedStudents))

        setStudent(defaultStudent)
      } else {
        setStudent(studentData)
      }

      // Load classes and attendance data
      loadClassesAndAttendance(
        studentData || {
          indexNumber: studentUser.identifier,
          name: studentUser.fullName || studentUser.identifier,
        },
      )
    } catch (error) {
      console.error("Error loading student data:", error)
      // Create fallback student data
      const fallbackStudent = {
        id: Date.now(),
        name: user?.fullName || user?.identifier || "Student",
        indexNumber: user?.identifier || "STU001",
        email: user?.email || "student@university.edu",
        department: "Computer Science",
        academicLevel: "Undergraduate",
        classes: [],
      }
      setStudent(fallbackStudent)
    } finally {
      setLoading(false)
    }
  }

  const loadClassesAndAttendance = (studentData: any) => {
    try {
      // Get all classes
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]")

      // Create sample classes with attendance data for this student
      const sampleClasses = [
        {
          id: 1,
          name: "Computer Science 101",
          code: "CS101",
          instructor: "Dr. Smith",
          totalSessions: 24,
          attendedSessions: 22,
          attendanceRate: 92,
          recentAttendance: [
            { date: "2024-01-15", status: "present" },
            { date: "2024-01-12", status: "present" },
            { date: "2024-01-10", status: "absent" },
            { date: "2024-01-08", status: "present" },
            { date: "2024-01-05", status: "present" },
          ],
        },
        {
          id: 2,
          name: "Data Structures",
          code: "CS201",
          instructor: "Prof. Johnson",
          totalSessions: 20,
          attendedSessions: 18,
          attendanceRate: 90,
          recentAttendance: [
            { date: "2024-01-14", status: "present" },
            { date: "2024-01-11", status: "present" },
            { date: "2024-01-09", status: "absent" },
            { date: "2024-01-07", status: "present" },
            { date: "2024-01-04", status: "present" },
          ],
        },
        {
          id: 3,
          name: "Web Development",
          code: "CS301",
          instructor: "Dr. Williams",
          totalSessions: 18,
          attendedSessions: 17,
          attendanceRate: 94,
          recentAttendance: [
            { date: "2024-01-13", status: "present" },
            { date: "2024-01-10", status: "present" },
            { date: "2024-01-08", status: "present" },
            { date: "2024-01-06", status: "present" },
            { date: "2024-01-03", status: "present" },
          ],
        },
      ]

      // Update student with classes
      setStudent((prev: any) => ({
        ...prev,
        classes: sampleClasses,
      }))
    } catch (error) {
      console.error("Error loading classes and attendance:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the student portal.</p>
          <Link href="/login">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  const overallAttendanceRate =
    student.classes && student.classes.length > 0
      ? Math.round(
          student.classes.reduce((sum: number, cls: any) => sum + cls.attendanceRate, 0) / student.classes.length,
        )
      : 0

  const totalSessions = student.classes
    ? student.classes.reduce((sum: number, cls: any) => sum + cls.totalSessions, 0)
    : 0
  const totalAttended = student.classes
    ? student.classes.reduce((sum: number, cls: any) => sum + cls.attendedSessions, 0)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/department-logo.png"
                  alt="Department Logo"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-logo.svg"
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-gray-600">Welcome back, {student.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/change-password">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold">{student.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Index Number</p>
                <p className="font-semibold">{student.indexNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{student.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold">{student.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overall Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  overallAttendanceRate >= 90
                    ? "text-green-600"
                    : overallAttendanceRate >= 80
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {overallAttendanceRate}%
              </div>
              <Progress value={overallAttendanceRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Classes Enrolled</CardTitle>
              <BookOpen className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.classes ? student.classes.length : 0}</div>
              <p className="text-xs text-gray-600 mt-1">Active classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sessions Attended</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalAttended}/{totalSessions}
              </div>
              <p className="text-xs text-gray-600 mt-1">Total sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Class Details */}
        <div className="space-y-6">
          {student.classes && student.classes.length > 0 ? (
            student.classes.map((classItem: any) => (
              <Card key={classItem.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{classItem.name}</CardTitle>
                      <CardDescription>
                        {classItem.code} • {classItem.instructor}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        classItem.attendanceRate >= 90
                          ? "default"
                          : classItem.attendanceRate >= 80
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {classItem.attendanceRate}% Attendance
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Sessions Attended</span>
                        <span>
                          {classItem.attendedSessions}/{classItem.totalSessions}
                        </span>
                      </div>
                      <Progress value={classItem.attendanceRate} />
                    </div>

                    {/* Recent Attendance */}
                    <div>
                      <h4 className="font-semibold mb-3">Recent Attendance</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {classItem.recentAttendance.map((record: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            {record.status === "present" ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <div>
                              <p className="text-xs font-medium">{record.date}</p>
                              <p
                                className={`text-xs ${record.status === "present" ? "text-green-600" : "text-red-600"}`}
                              >
                                {record.status === "present" ? "Present" : "Absent"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Enrolled</h3>
                  <p className="text-gray-600 mb-4">You are not enrolled in any classes yet.</p>
                  <p className="text-sm text-gray-500">Contact your academic advisor to enroll in classes.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Attendance Alert */}
        {overallAttendanceRate < 80 && overallAttendanceRate > 0 && (
          <Card className="mt-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800">Attendance Warning</h3>
                  <p className="text-sm text-yellow-700">
                    Your overall attendance is below 80%. Please attend classes regularly to maintain good academic
                    standing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
