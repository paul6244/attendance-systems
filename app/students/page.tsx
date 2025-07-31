"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Users, GraduationCap, Filter, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState("all")
  const [filterProgram, setFilterProgram] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
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

    loadStudents()

    // Listen for student updates
    const handleStudentsUpdate = () => {
      loadStudents()
    }

    window.addEventListener("studentsUpdated", handleStudentsUpdate)
    window.addEventListener("storage", handleStudentsUpdate)

    return () => {
      window.removeEventListener("studentsUpdated", handleStudentsUpdate)
      window.removeEventListener("storage", handleStudentsUpdate)
    }
  }, [router])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, filterLevel, filterProgram])

  const loadStudents = () => {
    try {
      const studentsData = JSON.parse(localStorage.getItem("students") || "[]")
      setStudents(studentsData)
    } catch (error) {
      console.error("Error loading students:", error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Academic level filter
    if (filterLevel !== "all") {
      filtered = filtered.filter((student) => student.academicLevel === filterLevel)
    }

    // Program type filter
    if (filterProgram !== "all") {
      filtered = filtered.filter((student) => student.programType === filterProgram)
    }

    setFilteredStudents(filtered)
  }

  const exportToCSV = () => {
    const headers = [
      "Index Number",
      "Full Name",
      "Email",
      "Phone",
      "Academic Level",
      "Program Type",
      "Registration Date",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map((student) =>
        [
          student.indexNumber,
          `"${student.fullName}"`,
          student.email,
          student.phone || "",
          student.academicLevel || "",
          student.programType || "",
          new Date(student.registrationDate).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `students-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Students Management</h1>
                <p className="text-gray-600">Manage registered students</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Link href="/admin-dashboard">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-gray-600 mt-1">Registered students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.filter((s) => s.status === "active").length}</div>
              <p className="text-xs text-gray-600 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Filtered Results</CardTitle>
              <Filter className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStudents.length}</div>
              <p className="text-xs text-gray-600 mt-1">Matching filters</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Academic Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="level1">Level 1</SelectItem>
                  <SelectItem value="level2">Level 2</SelectItem>
                  <SelectItem value="level3">Level 3</SelectItem>
                  <SelectItem value="level4">Level 4</SelectItem>
                  <SelectItem value="masters">Masters</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Program Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="fulltime">Full Time</SelectItem>
                  <SelectItem value="parttime">Part Time</SelectItem>
                  <SelectItem value="distance">Distance Learning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  setSearchTerm("")
                  setFilterLevel("all")
                  setFilterProgram("all")
                }}
                variant="outline"
                className="bg-transparent"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
            <CardDescription>
              {filteredStudents.length === students.length
                ? "All registered students"
                : `Showing ${filteredStudents.length} of ${students.length} students`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {students.length === 0 ? "No Students Yet" : "No Students Found"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {students.length === 0
                    ? "No students have registered yet."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {students.length === 0 && (
                  <Link href="/admin/add-student">
                    <Button className="gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Add First Student
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{student.fullName}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm text-gray-600">
                        <span className="font-medium">{student.indexNumber}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{student.email}</span>
                        {student.phone && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span>{student.phone}</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs text-gray-500 mt-1">
                        {student.academicLevel && (
                          <span className="capitalize">{student.academicLevel.replace(/([A-Z])/g, " $1")}</span>
                        )}
                        {student.programType && student.academicLevel && <span className="hidden sm:inline">•</span>}
                        {student.programType && (
                          <span className="capitalize">{student.programType.replace(/([A-Z])/g, " $1")}</span>
                        )}
                        <span className="hidden sm:inline">•</span>
                        <span>Registered: {new Date(student.registrationDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={student.status === "active" ? "default" : "secondary"}>{student.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
