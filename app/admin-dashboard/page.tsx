"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LogOut,
  Users,
  BookOpen,
  Calendar,
  UserCheck,
  GraduationCap,
  Share2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([])
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
    if (parsedUser.type !== "admin") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    loadData()

    // Listen for data updates
    const handleDataUpdate = () => {
      loadData()
    }

    window.addEventListener("studentsUpdated", handleDataUpdate)
    window.addEventListener("teachersUpdated", handleDataUpdate)
    window.addEventListener("classesUpdated", handleDataUpdate)

    return () => {
      window.removeEventListener("studentsUpdated", handleDataUpdate)
      window.removeEventListener("teachersUpdated", handleDataUpdate)
      window.removeEventListener("classesUpdated", handleDataUpdate)
    }
  }, [router])

  const loadData = () => {
    try {
      const studentsData = JSON.parse(localStorage.getItem("students") || "[]")
      const teachersData = JSON.parse(localStorage.getItem("teachers") || "[]")
      const classesData = JSON.parse(localStorage.getItem("classes") || "[]")

      setStudents(studentsData)
      setTeachers(teachersData.filter((t: any) => t.status === "approved"))
      setClasses(classesData)
      setPendingTeachers(teachersData.filter((t: any) => t.status === "pending"))
    } catch (error) {
      console.error("Error loading data:", error)
      setStudents([])
      setTeachers([])
      setClasses([])
      setPendingTeachers([])
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

  const handleApproveTeacher = (teacherId: string) => {
    try {
      const allTeachers = JSON.parse(localStorage.getItem("teachers") || "[]")
      const updatedTeachers = allTeachers.map((teacher: any) =>
        teacher.id === teacherId ? { ...teacher, status: "approved" } : teacher,
      )
      localStorage.setItem("teachers", JSON.stringify(updatedTeachers))
      window.dispatchEvent(new CustomEvent("teachersUpdated"))
      loadData()
    } catch (error) {
      console.error("Error approving teacher:", error)
    }
  }

  const handleRejectTeacher = (teacherId: string) => {
    try {
      const allTeachers = JSON.parse(localStorage.getItem("teachers") || "[]")
      const updatedTeachers = allTeachers.filter((teacher: any) => teacher.id !== teacherId)
      localStorage.setItem("teachers", JSON.stringify(updatedTeachers))
      window.dispatchEvent(new CustomEvent("teachersUpdated"))
      loadData()
    } catch (error) {
      console.error("Error rejecting teacher:", error)
    }
  }

  const getActiveStudents = () => students.filter((s) => s.status === "active").length
  const getActiveTeachers = () => teachers.length
  const getActiveClasses = () => classes.length
  const getTotalAttendanceSessions = () => {
    try {
      const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
      return attendance.length
    } catch {
      return 0
    }
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
    return <div>Loading...</div>
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
                  alt="KSTU Computer Science Students Association Logo"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-logo.svg"
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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

        {/* Pending Approvals Alert */}
        {pendingTeachers.length > 0 && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You have {pendingTeachers.length} teacher{pendingTeachers.length > 1 ? "s" : ""} waiting for approval.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getActiveStudents()}</div>
              <p className="text-xs text-gray-600 mt-1">Registered students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Teachers</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getActiveTeachers()}</div>
              <p className="text-xs text-gray-600 mt-1">Approved teachers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getActiveClasses()}</div>
              <p className="text-xs text-gray-600 mt-1">Active classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Attendance Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalAttendanceSessions()}</div>
              <p className="text-xs text-gray-600 mt-1">Total sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="approvals" className="relative">
              Approvals
              {pendingTeachers.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {pendingTeachers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/admin/add-student">
                    <Button className="w-full h-20 flex flex-col gap-2">
                      <GraduationCap className="h-6 w-6" />
                      Add Student
                    </Button>
                  </Link>
                  <Link href="/admin/add-teacher">
                    <Button className="w-full h-20 flex flex-col gap-2 bg-transparent" variant="outline">
                      <Users className="h-6 w-6" />
                      Add Teacher
                    </Button>
                  </Link>
                  <Link href="/admin/add-class">
                    <Button className="w-full h-20 flex flex-col gap-2 bg-transparent" variant="outline">
                      <BookOpen className="h-6 w-6" />
                      Add Class
                    </Button>
                  </Link>
                  <Link href="/reports">
                    <Button className="w-full h-20 flex flex-col gap-2 bg-transparent" variant="outline">
                      <Calendar className="h-6 w-6" />
                      View Reports
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

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
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/student-register`
                          : "/student-register"}
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
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/teacher-register`
                          : "/teacher-register"}
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
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Students ({getActiveStudents()})</CardTitle>
                <CardDescription>Manage registered students</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Yet</h3>
                    <p className="text-gray-600 mb-4">No students have registered yet.</p>
                    <Button onClick={handleShareStudentLink} className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share Registration Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{student.fullName}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm text-gray-600">
                            <span>{student.indexNumber}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{student.email}</span>
                            {student.academicLevel && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="capitalize">{student.academicLevel.replace(/([A-Z])/g, " $1")}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={student.status === "active" ? "default" : "secondary"}>
                            {student.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(student.registrationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <CardTitle>Teachers ({getActiveTeachers()})</CardTitle>
                <CardDescription>Manage approved teachers</CardDescription>
              </CardHeader>
              <CardContent>
                {teachers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Teachers Yet</h3>
                    <p className="text-gray-600 mb-4">No teachers have been approved yet.</p>
                    <Button onClick={handleShareTeacherLink} className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share Registration Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teachers.map((teacher) => (
                      <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{teacher.fullName}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm text-gray-600">
                            <span>{teacher.username}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{teacher.email}</span>
                            {teacher.department && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="capitalize">{teacher.department.replace(/-/g, " ")}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="default">Approved</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(teacher.registrationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle>Classes ({getActiveClasses()})</CardTitle>
                <CardDescription>Manage active classes</CardDescription>
              </CardHeader>
              <CardContent>
                {classes.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Yet</h3>
                    <p className="text-gray-600 mb-4">No classes have been created yet.</p>
                    <Link href="/admin/add-class">
                      <Button className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Add First Class
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {classes.map((classItem) => (
                      <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{classItem.className}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm text-gray-600">
                            <span>{classItem.classCode}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{classItem.teacherName}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              {classItem.currentStudents || 0}/{classItem.maxStudents} students
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="default">Active</Badge>
                          <span className="text-xs text-gray-500">{classItem.attendanceRate || 0}% attendance</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Approvals ({pendingTeachers.length})</CardTitle>
                <CardDescription>Review and approve teacher registration requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTeachers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
                    <p className="text-gray-600">All teacher registration requests have been processed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingTeachers.map((teacher) => (
                      <div key={teacher.id} className="p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{teacher.fullName}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm text-gray-600">
                              <span>{teacher.username}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{teacher.email}</span>
                              {teacher.department && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="capitalize">{teacher.department.replace(/-/g, " ")}</span>
                                </>
                              )}
                            </div>
                            {teacher.employeeId && (
                              <p className="text-xs text-gray-500 mt-1">Employee ID: {teacher.employeeId}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Applied: {new Date(teacher.registrationDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button onClick={() => handleApproveTeacher(teacher.id)} size="sm" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRejectTeacher(teacher.id)}
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
