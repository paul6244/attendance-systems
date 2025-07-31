"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Users, Calendar, Search, UserCheck, UserX, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock class data
const classData = {
  1: {
    id: 1,
    name: "Computer Science 101",
    code: "CS101",
    instructor: "Dr. Smith",
    schedule: "Mon, Wed, Fri - 9:00 AM",
  },
  2: {
    id: 2,
    name: "Data Structures",
    code: "CS201",
    instructor: "Prof. Johnson",
    schedule: "Tue, Thu - 2:00 PM",
  },
}

// Mock students enrolled in classes
const enrolledStudents = {
  1: [
    { id: 1, indexNumber: "CS/2024/001", name: "Alice Johnson", email: "alice@university.edu" },
    { id: 2, indexNumber: "CS/2024/002", name: "Bob Smith", email: "bob@university.edu" },
    { id: 3, indexNumber: "CS/2024/003", name: "Carol Davis", email: "carol@university.edu" },
    { id: 4, indexNumber: "CS/2024/004", name: "David Wilson", email: "david@university.edu" },
    { id: 5, indexNumber: "CS/2024/005", name: "Emma Brown", email: "emma@university.edu" },
  ],
  2: [
    { id: 2, indexNumber: "CS/2024/002", name: "Bob Smith", email: "bob@university.edu" },
    { id: 4, indexNumber: "CS/2024/004", name: "David Wilson", email: "david@university.edu" },
    { id: 6, indexNumber: "CS/2024/006", name: "Frank Miller", email: "frank@university.edu" },
    { id: 7, indexNumber: "CS/2024/007", name: "Grace Lee", email: "grace@university.edu" },
  ],
}

export default function MarkAttendancePage({ params }: { params: { classId: string } }) {
  const [user, setUser] = useState<any>(null)
  const [indexInput, setIndexInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [presentStudents, setPresentStudents] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const classId = Number.parseInt(params.classId)
  const currentClass = classData[classId as keyof typeof classData]
  const students = enrolledStudents[classId as keyof typeof enrolledStudents] || []

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
  }, [router])

  const handleMarkPresent = () => {
    if (!indexInput.trim()) {
      setMessage({ type: "error", text: "Please enter an index number." })
      return
    }

    const student = students.find((s) => s.indexNumber.toLowerCase() === indexInput.toLowerCase())
    if (!student) {
      setMessage({ type: "error", text: "Student not found in this class." })
      return
    }

    if (presentStudents.has(student.indexNumber)) {
      setMessage({ type: "error", text: "Student already marked present." })
      return
    }

    setPresentStudents((prev) => new Set([...prev, student.indexNumber]))
    setIndexInput("")
    setMessage({ type: "success", text: `${student.name} marked present.` })

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const handleToggleAttendance = (indexNumber: string) => {
    setPresentStudents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(indexNumber)) {
        newSet.delete(indexNumber)
      } else {
        newSet.add(indexNumber)
      }
      return newSet
    })
  }

  const handleSaveAttendance = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const attendanceData = {
        classId,
        date: new Date().toISOString().split("T")[0],
        presentStudents: Array.from(presentStudents),
        totalStudents: students.length,
      }

      console.log("Saving attendance:", attendanceData)
      setMessage({ type: "success", text: "Attendance saved successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save attendance. Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const presentCount = presentStudents.size
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0

  if (!user || !currentClass) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link href="/teacher-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentClass.name}</h1>
                <p className="text-gray-600">
                  {currentClass.code} • {currentClass.schedule}
                </p>
              </div>
            </div>
            <Button onClick={handleSaveAttendance} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Mark Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Mark Present</CardTitle>
            <CardDescription>Enter student index number to mark attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter index number (e.g., CS/2024/001)"
                  value={indexInput}
                  onChange={(e) => setIndexInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && handleMarkPresent()}
                />
              </div>
              <Button onClick={handleMarkPresent} className="gap-2">
                <Plus className="h-4 w-4" />
                Mark Present
              </Button>
            </div>

            {message && (
              <Alert
                className={`mt-4 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
              >
                <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Date</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Present</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {presentCount}/{students.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  attendanceRate >= 90 ? "text-green-600" : attendanceRate >= 80 ? "text-yellow-600" : "text-red-600"
                }`}
              >
                {attendanceRate}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Student List</CardTitle>
                <CardDescription>All students enrolled in this class</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const isPresent = presentStudents.has(student.indexNumber)
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-600">
                          {student.indexNumber} • {student.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={isPresent ? "default" : "secondary"}>{isPresent ? "Present" : "Absent"}</Badge>
                      <Button
                        onClick={() => handleToggleAttendance(student.indexNumber)}
                        variant={isPresent ? "destructive" : "default"}
                        size="sm"
                        className="gap-2"
                      >
                        {isPresent ? (
                          <>
                            <UserX className="h-4 w-4" />
                            Mark Absent
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4" />
                            Mark Present
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
