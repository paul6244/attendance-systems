"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Save,
  Users,
  Calendar,
  Search,
  Edit3,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock attendance data
const attendanceRecords = [
  {
    id: 1,
    date: "2024-01-15",
    classId: 1,
    records: [
      { studentId: 1, indexNumber: "CS/2024/001", name: "Alice Johnson", status: "present" },
      { studentId: 2, indexNumber: "CS/2024/002", name: "Bob Smith", status: "present" },
      { studentId: 3, indexNumber: "CS/2024/003", name: "Carol Davis", status: "absent" },
      { studentId: 4, indexNumber: "CS/2024/004", name: "David Wilson", status: "present" },
      { studentId: 5, indexNumber: "CS/2024/005", name: "Emma Brown", status: "absent" },
    ],
  },
  {
    id: 2,
    date: "2024-01-12",
    classId: 1,
    records: [
      { studentId: 1, indexNumber: "CS/2024/001", name: "Alice Johnson", status: "present" },
      { studentId: 2, indexNumber: "CS/2024/002", name: "Bob Smith", status: "absent" },
      { studentId: 3, indexNumber: "CS/2024/003", name: "Carol Davis", status: "present" },
      { studentId: 4, indexNumber: "CS/2024/004", name: "David Wilson", status: "present" },
      { studentId: 5, indexNumber: "CS/2024/005", name: "Emma Brown", status: "present" },
    ],
  },
  {
    id: 3,
    date: "2024-01-10",
    classId: 1,
    records: [
      { studentId: 1, indexNumber: "CS/2024/001", name: "Alice Johnson", status: "absent" },
      { studentId: 2, indexNumber: "CS/2024/002", name: "Bob Smith", status: "present" },
      { studentId: 3, indexNumber: "CS/2024/003", name: "Carol Davis", status: "present" },
      { studentId: 4, indexNumber: "CS/2024/004", name: "David Wilson", status: "absent" },
      { studentId: 5, indexNumber: "CS/2024/005", name: "Emma Brown", status: "present" },
    ],
  },
]

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

export default function AttendanceRecordsPage({ params }: { params: { classId: string } }) {
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [editingRecord, setEditingRecord] = useState<number | null>(null)
  const [editedAttendance, setEditedAttendance] = useState<any>({})
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState("view")
  const router = useRouter()

  const classId = Number.parseInt(params.classId)
  const currentClass = classData[classId as keyof typeof classData]
  const classRecords = attendanceRecords.filter((record) => record.classId === classId)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (!["teacher", "admin"].includes(parsedUser.type)) {
      router.push("/login")
      return
    }

    setUser(parsedUser)
  }, [router])

  const handleEditRecord = (recordId: number) => {
    setEditingRecord(recordId)
    const record = classRecords.find((r) => r.id === recordId)
    if (record) {
      const attendanceMap = record.records.reduce((acc, student) => {
        acc[student.studentId] = student.status
        return acc
      }, {} as any)
      setEditedAttendance(attendanceMap)
    }
    setActiveTab("edit")
  }

  const handleSaveEdit = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, this would update the database
      console.log("Saving edited attendance:", editedAttendance)

      setMessage({ type: "success", text: "Attendance record updated successfully!" })
      setEditingRecord(null)
      setActiveTab("view")

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update attendance record." })
    }
  }

  const handleCancelEdit = () => {
    setEditingRecord(null)
    setEditedAttendance({})
    setActiveTab("view")
  }

  const handleToggleAttendance = (studentId: number, currentStatus: string) => {
    setEditedAttendance((prev: any) => ({
      ...prev,
      [studentId]: currentStatus === "present" ? "absent" : "present",
    }))
  }

  const filteredRecords = classRecords.filter((record) => {
    const matchesDate = !selectedDate || record.date === selectedDate
    const matchesSearch =
      !searchTerm ||
      record.records.some(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    return matchesDate && matchesSearch
  })

  const exportAttendance = () => {
    // Create CSV content
    const csvContent = [
      ["Date", "Index Number", "Student Name", "Status"],
      ...classRecords.flatMap((record) =>
        record.records.map((student) => [record.date, student.indexNumber, student.name, student.status]),
      ),
    ]
      .map((row) => row.join(","))
      .join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${currentClass?.code}_attendance_records.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

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
              <Link href={user.type === "teacher" ? "/teacher-dashboard" : "/admin-dashboard"}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
                <p className="text-gray-600">
                  {currentClass.name} • {currentClass.code}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={exportAttendance} variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              {editingRecord && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <Alert
            className={`mb-6 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
          >
            <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  placeholder="Filter by date"
                />
              </div>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedDate("")
                }}
                variant="outline"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="view" className="gap-2">
              <Eye className="h-4 w-4" />
              View Records
            </TabsTrigger>
            <TabsTrigger value="edit" className="gap-2" disabled={!editingRecord}>
              <Edit3 className="h-4 w-4" />
              Edit Record
            </TabsTrigger>
          </TabsList>

          {/* View Records Tab */}
          <TabsContent value="view">
            <div className="space-y-6">
              {filteredRecords.map((record) => {
                const presentCount = record.records.filter((s) => s.status === "present").length
                const totalCount = record.records.length
                const attendanceRate = Math.round((presentCount / totalCount) * 100)

                return (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center gap-3">
                            <Calendar className="h-5 w-5" />
                            {new Date(record.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </CardTitle>
                          <CardDescription>
                            {presentCount}/{totalCount} students present ({attendanceRate}%)
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              attendanceRate >= 90 ? "default" : attendanceRate >= 80 ? "secondary" : "destructive"
                            }
                          >
                            {attendanceRate}% Attendance
                          </Badge>
                          <Button
                            onClick={() => handleEditRecord(record.id)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {record.records.map((student) => (
                          <div
                            key={student.studentId}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-xs">
                                  {student.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{student.name}</p>
                                <p className="text-xs text-gray-600">{student.indexNumber}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {student.status === "present" ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <Badge
                                variant={student.status === "present" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {student.status === "present" ? "Present" : "Absent"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {filteredRecords.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h3>
                    <p className="text-gray-600">
                      {searchTerm || selectedDate
                        ? "No attendance records match your current filters."
                        : "No attendance records available for this class."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Edit Record Tab */}
          <TabsContent value="edit">
            {editingRecord && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Attendance Record</CardTitle>
                  <CardDescription>
                    Modify attendance for {classRecords.find((r) => r.id === editingRecord)?.date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classRecords
                      .find((r) => r.id === editingRecord)
                      ?.records.map((student) => {
                        const currentStatus = editedAttendance[student.studentId] || student.status
                        return (
                          <div
                            key={student.studentId}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {student.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-gray-600">{student.indexNumber}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={currentStatus === "present" ? "default" : "secondary"}>
                                {currentStatus === "present" ? "Present" : "Absent"}
                              </Badge>
                              <Button
                                onClick={() => handleToggleAttendance(student.studentId, currentStatus)}
                                variant={currentStatus === "present" ? "destructive" : "default"}
                                size="sm"
                              >
                                Mark {currentStatus === "present" ? "Absent" : "Present"}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
