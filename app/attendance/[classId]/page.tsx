"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Users, Calendar } from "lucide-react"
import Link from "next/link"

// Mock data - in a real app, this would come from a database
const classData = {
  id: 1,
  name: "Computer Science 101",
  instructor: "Dr. Smith",
  schedule: "Mon, Wed, Fri - 9:00 AM",
  date: new Date().toLocaleDateString(),
}

const students = [
  { id: 1, name: "Alice Johnson", studentId: "CS001", email: "alice@university.edu", present: false },
  { id: 2, name: "Bob Smith", studentId: "CS002", email: "bob@university.edu", present: true },
  { id: 3, name: "Carol Davis", studentId: "CS003", email: "carol@university.edu", present: false },
  { id: 4, name: "David Wilson", studentId: "CS004", email: "david@university.edu", present: true },
  { id: 5, name: "Emma Brown", studentId: "CS005", email: "emma@university.edu", present: false },
  { id: 6, name: "Frank Miller", studentId: "CS006", email: "frank@university.edu", present: true },
  { id: 7, name: "Grace Lee", studentId: "CS007", email: "grace@university.edu", present: false },
  { id: 8, name: "Henry Taylor", studentId: "CS008", email: "henry@university.edu", present: true },
  { id: 9, name: "Ivy Chen", studentId: "CS009", email: "ivy@university.edu", present: false },
  { id: 10, name: "Jack Anderson", studentId: "CS010", email: "jack@university.edu", present: true },
]

export default function AttendancePage({ params }: { params: { classId: string } }) {
  const [attendance, setAttendance] = useState(
    students.reduce(
      (acc, student) => {
        acc[student.id] = student.present
        return acc
      },
      {} as Record<number, boolean>,
    ),
  )

  const handleAttendanceChange = (studentId: number, present: boolean) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: present,
    }))
  }

  const handleSaveAttendance = () => {
    // In a real app, this would save to a database
    console.log("Saving attendance:", attendance)
    alert("Attendance saved successfully!")
  }

  const presentCount = Object.values(attendance).filter(Boolean).length
  const totalStudents = students.length
  const attendanceRate = Math.round((presentCount / totalStudents) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
                <p className="text-gray-600">
                  {classData.instructor} • {classData.schedule}
                </p>
              </div>
            </div>
            <Button onClick={handleSaveAttendance} className="gap-2">
              <Save className="h-4 w-4" />
              Save Attendance
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Attendance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Date</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classData.date}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Present</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {presentCount}/{totalStudents}
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
            <CardTitle>Student Attendance</CardTitle>
            <CardDescription>Mark students as present or absent for today's class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={attendance[student.id]}
                      onCheckedChange={(checked) => handleAttendanceChange(student.id, checked as boolean)}
                    />
                    <div>
                      <label
                        htmlFor={`student-${student.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {student.name}
                      </label>
                      <p className="text-sm text-gray-600">
                        {student.studentId} • {student.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant={attendance[student.id] ? "default" : "secondary"}>
                    {attendance[student.id] ? "Present" : "Absent"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
