"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, Users, Calendar, BookOpen, Lock, Eye, Share2, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null)
  const [teacherClasses, setTeacherClasses] = useState<any[]>([])
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.type !== "teacher") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    loadTeacherData(parsedUser)
  }, [router])

  const loadTeacherData = (teacherUser: any) => {
    try {
      // Load all classes from localStorage
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]")

      // Filter classes assigned to this teacher - check multiple possible identifiers
      const myClasses = allClasses.filter((cls: any) => {
        return (
          cls.teacherUsername === teacherUser.identifier ||
          cls.teacherId === teacherUser.id ||
          cls.teacherName === teacherUser.fullName ||
          cls.instructor === teacherUser.fullName ||
          cls.instructor === teacherUser.identifier
        )
      })

      // If no classes found, create some sample classes for this teacher
      if (myClasses.length === 0) {
        const sampleClasses = [
          {
            id: Date.now(),
            className: "Computer Science 101",
            classCode: "CS101",
            departmentName: "Computer Science",
            teacherUsername: teacherUser.identifier,
            teacherName: teacherUser.fullName,
            instructor: teacherUser.fullName,
            maxStudents: 50,
            currentStudents: 25,
            schedule: "Mon, Wed, Fri - 9:00 AM",
            attendanceRate: 85,
            status: "active",
          },
          {
            id: Date.now() + 1,
            className: "Data Structures",
            classCode: "CS201",
            departmentName: "Computer Science",
            teacherUsername: teacherUser.identifier,
            teacherName: teacherUser.fullName,
            instructor: teacherUser.fullName,
            maxStudents: 40,
            currentStudents: 30,
            schedule: "Tue, Thu - 2:00 PM",
            attendanceRate: 92,
            status: "active",
          },
        ]

        // Save sample classes to localStorage
        const updatedClasses = [...allClasses, ...sampleClasses]
        localStorage.setItem("classes", JSON.stringify(updatedClasses))
        setTeacherClasses(sampleClasses)
      } else {
        setTeacherClasses(myClasses)
      }

      // Load recent attendance sessions
      const allAttendance = JSON.parse(localStorage.getItem("attendance") || "[]")
      const myClassIds = myClasses.map((cls: any) => cls.id)

      const myRecentSessions = allAttendance
        .filter((session: any) => myClassIds.includes(session.classId))
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map((session: any) => {
          const classInfo = myClasses.find((cls: any) => cls.id === session.classId)
          return {
            date: session.date,
            class: classInfo?.classCode || "Unknown",
            className: classInfo?.className || "Unknown Class",
            present: session.presentCount || 0,
            total: session.totalStudents || 0,
            rate: session.attendanceRate || 0,
          }
        })

      setRecentSessions(myRecentSessions)
    } catch (error) {
      console.error("Error loading teacher data:", error)
      // Create default classes if there's an error
      const defaultClasses = [
        {
          id: Date.now(),
          className: "Computer Science 101",
          classCode: "CS101",
          departmentName: "Computer Science",
          teacherUsername: teacherUser.identifier,
          teacherName: teacherUser.fullName,
          instructor: teacherUser.fullName,
          maxStudents: 50,
          currentStudents: 25,
          schedule: "Mon, Wed, Fri - 9:00 AM",
          attendanceRate: 85,
          status: "active",
        },
      ]
      setTeacherClasses(defaultClasses)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleShareStudentLink = () => {
    const shareUrl = `${window.location.origin}/student-register`
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareMessage("Student registration link copied to clipboard!")
      setTimeout(() => setShareMessage(null), 3000)
    })
  }

  const handleShareTeacherLink = () => {
    const shareUrl = `${window.location.origin}/teacher-register`
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareMessage("Teacher registration link copied to clipboard!")
      setTimeout(() => setShareMessage(null), 3000)
    })
  }

  const calculateOverallAttendance = () => {
    if (teacherClasses.length === 0) return 0
    const totalRate = teacherClasses.reduce((sum, cls) => sum + (cls.attendanceRate || 0), 0)
    return Math.round(totalRate / teacherClasses.length)
  }

  const getTotalStudents = () => {
    return teacherClasses.reduce((sum, cls) => sum + (cls.currentStudents || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the teacher dashboard.</p>
          <Link href="/login">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.fullName || user.identifier}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex gap-1">
                <Button
                  onClick={handleShareStudentLink}
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-transparent text-xs"
                >
                  <Share2 className="h-3 w-3" />
                  Student Link
                </Button>
                <Button
                  onClick={handleShareTeacherLink}
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-transparent text-xs"
                >
                  <Share2 className="h-3 w-3" />
                  Teacher Link
                </Button>
              </div>
              <Link href="/change-password">
                <Button variant="outline" className="gap-2 bg-transparent text-xs sm:text-sm">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Change Password</span>
                  <span className="sm:hidden">Password</span>
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent text-xs sm:text-sm">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Share Message */}
        {shareMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{shareMessage}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">My Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teacherClasses.length}</div>
              <p className="text-xs text-gray-600 mt-1">Active classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalStudents()}</div>
              <p className="text-xs text-gray-600 mt-1">Across all classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  calculateOverallAttendance() >= 90
                    ? "text-green-600"
                    : calculateOverallAttendance() >= 80
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {calculateOverallAttendance()}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Overall rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recent Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentSessions.length}</div>
              <p className="text-xs text-gray-600 mt-1">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* My Classes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>Classes you are teaching this semester</CardDescription>
          </CardHeader>
          <CardContent>
            {teacherClasses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Assigned</h3>
                <p className="text-gray-600 mb-4">You don't have any classes assigned yet.</p>
                <p className="text-sm text-gray-500">
                  Contact your administrator to get classes assigned to your account.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {teacherClasses.map((classItem) => (
                  <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg truncate">{classItem.className}</CardTitle>
                          <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span>{classItem.classCode}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs">{classItem.departmentName}</span>
                          </CardDescription>
                        </div>
                        <Badge variant="default" className="ml-2 flex-shrink-0">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Students:</span>
                            <span className="font-medium">{classItem.currentStudents || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Max:</span>
                            <span className="font-medium">{classItem.maxStudents}</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Schedule:</span>
                          </div>
                          <span className="font-medium text-xs sm:text-sm break-words">{classItem.schedule}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Attendance Rate:</span>
                          <span
                            className={`font-medium ${
                              (classItem.attendanceRate || 0) >= 90
                                ? "text-green-600"
                                : (classItem.attendanceRate || 0) >= 80
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {classItem.attendanceRate || 0}%
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-2">
                          <Link href={`/mark-attendance/${classItem.id}`} className="w-full">
                            <Button className="w-full" size="sm">
                              Mark Attendance
                            </Button>
                          </Link>
                          <div className="grid grid-cols-2 gap-2">
                            <Link href={`/attendance-records/${classItem.id}`}>
                              <Button variant="outline" size="sm" className="w-full gap-1 bg-transparent text-xs">
                                <Eye className="h-3 w-3" />
                                <span className="hidden sm:inline">View Records</span>
                                <span className="sm:hidden">Records</span>
                              </Button>
                            </Link>
                            <Link href={`/reports`}>
                              <Button variant="outline" size="sm" className="w-full bg-transparent text-xs">
                                Reports
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Attendance Sessions</CardTitle>
              <CardDescription>Your latest attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((session, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{session.className}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm text-gray-600">
                        <span>{session.class}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="font-semibold">
                          {session.present}/{session.total}
                        </div>
                        <p className="text-xs text-gray-600">Present</p>
                      </div>
                      <Badge
                        variant={session.rate >= 90 ? "default" : session.rate >= 80 ? "secondary" : "destructive"}
                        className="min-w-[50px] justify-center"
                      >
                        {session.rate}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Registration */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Share2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-green-800">Student Registration Link</h3>
                  <p className="text-sm text-green-700 mt-1">Share this link with students:</p>
                  <div className="mt-2 p-2 bg-green-100 rounded text-xs font-mono break-all">
                    {typeof window !== "undefined" ? `${window.location.origin}/student-register` : "/student-register"}
                  </div>
                  <Button
                    onClick={handleShareStudentLink}
                    size="sm"
                    variant="outline"
                    className="mt-2 gap-1 bg-transparent border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Registration */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Share2 className="h-4 w-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-purple-800">Teacher Registration Link</h3>
                  <p className="text-sm text-purple-700 mt-1">Share this link with faculty:</p>
                  <div className="mt-2 p-2 bg-purple-100 rounded text-xs font-mono break-all">
                    {typeof window !== "undefined" ? `${window.location.origin}/teacher-register` : "/teacher-register"}
                  </div>
                  <Button
                    onClick={handleShareTeacherLink}
                    size="sm"
                    variant="outline"
                    className="mt-2 gap-1 bg-transparent border-purple-300 text-purple-700 hover:bg-purple-100"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
