"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Download,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  Search,
  Filter,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    loadReportData(parsedUser)
  }, [router])

  const loadReportData = (currentUser: any) => {
    try {
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]")
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]")
      const allAttendance = JSON.parse(localStorage.getItem("attendance") || "[]")

      // Filter data based on user type
      let userClasses = allClasses
      if (currentUser.type === "teacher") {
        userClasses = allClasses.filter(
          (cls: any) =>
            cls.teacherUsername === currentUser.identifier ||
            cls.teacherId === currentUser.id ||
            cls.teacherName === currentUser.fullName,
        )
      }

      setClasses(userClasses)
      setStudents(allStudents)
      setAttendanceData(allAttendance)
    } catch (error) {
      console.error("Error loading report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateClassReport = (classId: string) => {
    const classInfo = classes.find((c) => c.id.toString() === classId)
    if (!classInfo) return null

    const classAttendance = attendanceData.filter((a) => a.classId.toString() === classId)
    const totalSessions = classAttendance.length
    const averageAttendance =
      totalSessions > 0
        ? Math.round(classAttendance.reduce((sum, session) => sum + (session.attendanceRate || 0), 0) / totalSessions)
        : 0

    return {
      ...classInfo,
      totalSessions,
      averageAttendance,
      recentSessions: classAttendance.slice(-5),
    }
  }

  const getOverallStats = () => {
    const totalClasses = classes.length
    const totalStudents = students.length
    const totalSessions = attendanceData.length
    const averageAttendance =
      totalSessions > 0
        ? Math.round(attendanceData.reduce((sum, session) => sum + (session.attendanceRate || 0), 0) / totalSessions)
        : 0

    return {
      totalClasses,
      totalStudents,
      totalSessions,
      averageAttendance,
    }
  }

  const getAttendanceTrends = () => {
    const last30Days = attendanceData
      .filter((session) => {
        const sessionDate = new Date(session.date)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return sessionDate >= thirtyDaysAgo
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return last30Days.map((session) => ({
      date: session.date,
      rate: session.attendanceRate || 0,
      present: session.presentCount || 0,
      total: session.totalStudents || 0,
    }))
  }

  const exportToCSV = () => {
    const stats = getOverallStats()
    const trends = getAttendanceTrends()

    let csvContent = "KSTU Attendance Report\n\n"
    csvContent += "Overall Statistics\n"
    csvContent += `Total Classes,${stats.totalClasses}\n`
    csvContent += `Total Students,${stats.totalStudents}\n`
    csvContent += `Total Sessions,${stats.totalSessions}\n`
    csvContent += `Average Attendance,${stats.averageAttendance}%\n\n`

    csvContent += "Attendance Trends (Last 30 Days)\n"
    csvContent += "Date,Attendance Rate,Present,Total\n"
    trends.forEach((trend) => {
      csvContent += `${trend.date},${trend.rate}%,${trend.present},${trend.total}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredClasses = classes.filter(
    (cls) =>
      cls.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.classCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = getOverallStats()
  const trends = getAttendanceTrends()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
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
              <div className="relative w-10 h-10 flex-shrink-0">
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance Reports</h1>
                <p className="text-gray-600">Comprehensive attendance analytics and insights</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-transparent text-xs sm:text-sm">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Link href={user?.type === "admin" ? "/admin-dashboard" : "/teacher-dashboard"}>
                <Button variant="outline" className="gap-2 bg-transparent text-xs sm:text-sm">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Classes</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
              <p className="text-xs text-gray-600 mt-1">Active classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-gray-600 mt-1">Enrolled students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-gray-600 mt-1">Recorded sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Attendance</CardTitle>
              {stats.averageAttendance >= 85 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  stats.averageAttendance >= 90
                    ? "text-green-600"
                    : stats.averageAttendance >= 80
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {stats.averageAttendance}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Overall rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Classes</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Select Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {filteredClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.classCode} - {cls.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Time Period</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="semester">This Semester</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Export Options</Label>
                <Button onClick={exportToCSV} variant="outline" className="w-full gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="classes" className="text-xs sm:text-sm">
              By Class
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-xs sm:text-sm">
              Trends
            </TabsTrigger>
            <TabsTrigger value="detailed" className="text-xs sm:text-sm">
              Detailed
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Attendance Summary
                  </CardTitle>
                  <CardDescription>Overall attendance distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Excellent (90%+)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${
                                (attendanceData.filter((s) => (s.attendanceRate || 0) >= 90).length /
                                  Math.max(attendanceData.length, 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(
                            (attendanceData.filter((s) => (s.attendanceRate || 0) >= 90).length /
                              Math.max(attendanceData.length, 1)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Good (80-89%)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500"
                            style={{
                              width: `${
                                (attendanceData.filter(
                                  (s) => (s.attendanceRate || 0) >= 80 && (s.attendanceRate || 0) < 90,
                                ).length /
                                  Math.max(attendanceData.length, 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(
                            (attendanceData.filter((s) => (s.attendanceRate || 0) >= 80 && (s.attendanceRate || 0) < 90)
                              .length /
                              Math.max(attendanceData.length, 1)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Needs Improvement (&lt;80%)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{
                              width: `${
                                (attendanceData.filter((s) => (s.attendanceRate || 0) < 80).length /
                                  Math.max(attendanceData.length, 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(
                            (attendanceData.filter((s) => (s.attendanceRate || 0) < 80).length /
                              Math.max(attendanceData.length, 1)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest attendance sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attendanceData
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((session, index) => {
                        const classInfo = classes.find((c) => c.id === session.classId)
                        return (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">
                                {classInfo?.className || "Unknown Class"}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {new Date(session.date).toLocaleDateString()} • {classInfo?.classCode || "Unknown"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm font-medium">
                                {session.presentCount || 0}/{session.totalStudents || 0}
                              </span>
                              <Badge
                                variant={
                                  (session.attendanceRate || 0) >= 90
                                    ? "default"
                                    : (session.attendanceRate || 0) >= 80
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {session.attendanceRate || 0}%
                              </Badge>
                            </div>
                          </div>
                        )
                      })}

                    {attendanceData.length === 0 && (
                      <div className="text-center py-6">
                        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No attendance sessions recorded yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredClasses.map((classItem) => {
                const report = generateClassReport(classItem.id.toString())
                if (!report) return null

                return (
                  <Card key={classItem.id}>
                    <CardHeader>
                      <CardTitle className="text-lg truncate">{report.className}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>{report.classCode}</span>
                        <Badge variant="outline" className="text-xs">
                          {report.totalSessions} sessions
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Average Attendance:</span>
                          <span
                            className={`font-semibold ${
                              report.averageAttendance >= 90
                                ? "text-green-600"
                                : report.averageAttendance >= 80
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {report.averageAttendance}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Students:</span>
                          <span className="font-medium">{report.currentStudents || 0}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Max Capacity:</span>
                          <span className="font-medium">{report.maxStudents}</span>
                        </div>

                        <div className="pt-2">
                          <h4 className="text-sm font-medium mb-2">Recent Sessions:</h4>
                          <div className="space-y-1">
                            {report.recentSessions.slice(0, 3).map((session: any, index: number) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="text-gray-600">{new Date(session.date).toLocaleDateString()}</span>
                                <span
                                  className={
                                    (session.attendanceRate || 0) >= 90
                                      ? "text-green-600"
                                      : (session.attendanceRate || 0) >= 80
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }
                                >
                                  {session.attendanceRate || 0}%
                                </span>
                              </div>
                            ))}
                            {report.recentSessions.length === 0 && (
                              <p className="text-xs text-gray-500">No sessions recorded</p>
                            )}
                          </div>
                        </div>

                        <Link href={`/attendance-records/${classItem.id}`}>
                          <Button variant="outline" size="sm" className="w-full gap-1 bg-transparent">
                            <FileText className="h-3 w-3" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {filteredClasses.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? "No classes match your search criteria." : "No classes available for reporting."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Attendance Trends
                </CardTitle>
                <CardDescription>Attendance patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                {trends.length > 0 ? (
                  <div className="space-y-6">
                    {/* Trend Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {trends.filter((t) => t.rate >= 90).length}
                        </div>
                        <p className="text-sm text-gray-600">Excellent Days</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {trends.filter((t) => t.rate >= 80 && t.rate < 90).length}
                        </div>
                        <p className="text-sm text-gray-600">Good Days</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {trends.filter((t) => t.rate < 80).length}
                        </div>
                        <p className="text-sm text-gray-600">Poor Days</p>
                      </div>
                    </div>

                    {/* Trend Chart (Simple representation) */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Daily Attendance Rates (Last 30 Days)</h4>
                      <div className="space-y-1">
                        {trends.slice(-10).map((trend, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 w-20">
                              {new Date(trend.date).toLocaleDateString()}
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${
                                  trend.rate >= 90 ? "bg-green-500" : trend.rate >= 80 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${trend.rate}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium w-12">{trend.rate}%</span>
                            <span className="text-xs text-gray-500 w-16">
                              {trend.present}/{trend.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Trend Data</h3>
                    <p className="text-gray-600">Not enough attendance data to show trends.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="detailed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detailed Report
                </CardTitle>
                <CardDescription>Comprehensive attendance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Export Options */}
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-transparent">
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>

                  {/* Detailed Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Class</th>
                          <th className="text-left p-2">Present</th>
                          <th className="text-left p-2">Total</th>
                          <th className="text-left p-2">Rate</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceData
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 20)
                          .map((session, index) => {
                            const classInfo = classes.find((c) => c.id === session.classId)
                            return (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-2">{new Date(session.date).toLocaleDateString()}</td>
                                <td className="p-2">
                                  <div>
                                    <div className="font-medium">{classInfo?.className || "Unknown"}</div>
                                    <div className="text-xs text-gray-500">{classInfo?.classCode || "N/A"}</div>
                                  </div>
                                </td>
                                <td className="p-2">{session.presentCount || 0}</td>
                                <td className="p-2">{session.totalStudents || 0}</td>
                                <td className="p-2">
                                  <span
                                    className={`font-medium ${
                                      (session.attendanceRate || 0) >= 90
                                        ? "text-green-600"
                                        : (session.attendanceRate || 0) >= 80
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                    }`}
                                  >
                                    {session.attendanceRate || 0}%
                                  </span>
                                </td>
                                <td className="p-2">
                                  <Badge
                                    variant={
                                      (session.attendanceRate || 0) >= 90
                                        ? "default"
                                        : (session.attendanceRate || 0) >= 80
                                          ? "secondary"
                                          : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    {(session.attendanceRate || 0) >= 90
                                      ? "Excellent"
                                      : (session.attendanceRate || 0) >= 80
                                        ? "Good"
                                        : "Poor"}
                                  </Badge>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>

                    {attendanceData.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                        <p className="text-gray-600">No attendance records found for the selected criteria.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
