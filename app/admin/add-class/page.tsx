"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, BookOpen } from "lucide-react"
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

const timeSlots = [
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
]

const days = [
  { id: "monday", name: "Monday" },
  { id: "tuesday", name: "Tuesday" },
  { id: "wednesday", name: "Wednesday" },
  { id: "thursday", name: "Thursday" },
  { id: "friday", name: "Friday" },
  { id: "saturday", name: "Saturday" },
]

export default function AddClassPage() {
  const [user, setUser] = useState<any>(null)
  const [teachers, setTeachers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    className: "",
    classCode: "",
    department: "",
    teacherId: "",
    description: "",
    credits: "",
    maxStudents: "",
    room: "",
    selectedDays: [] as string[],
    timeSlot: "",
    semester: "",
    academicYear: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
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

    // Load teachers
    const teachersData = JSON.parse(localStorage.getItem("teachers") || "[]")
    setTeachers(teachersData)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    // Validate form
    if (
      !formData.className ||
      !formData.classCode ||
      !formData.department ||
      !formData.teacherId ||
      !formData.credits ||
      !formData.maxStudents ||
      formData.selectedDays.length === 0 ||
      !formData.timeSlot
    ) {
      setMessage({ type: "error", text: "Please fill in all required fields." })
      setIsSubmitting(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Get existing classes
      const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]")

      // Check if class code already exists
      const classCodeExists = existingClasses.some((c: any) => c.classCode === formData.classCode)

      if (classCodeExists) {
        setMessage({ type: "error", text: "Class code already exists. Please use a different one." })
        setIsSubmitting(false)
        return
      }

      // Get teacher info
      const teacher = teachers.find((t) => t.id.toString() === formData.teacherId)
      if (!teacher) {
        setMessage({ type: "error", text: "Selected teacher not found." })
        setIsSubmitting(false)
        return
      }

      // Create schedule string
      const scheduleString = `${formData.selectedDays.join(", ")} - ${formData.timeSlot}`

      // Create new class
      const newClass = {
        id: Date.now(),
        className: formData.className,
        classCode: formData.classCode,
        department: formData.department,
        departmentName: departments.find((d) => d.id === formData.department)?.name || "",
        teacherId: Number.parseInt(formData.teacherId),
        teacherName: teacher.fullName,
        teacherUsername: teacher.username,
        description: formData.description,
        credits: Number.parseInt(formData.credits),
        maxStudents: Number.parseInt(formData.maxStudents),
        currentStudents: 0,
        room: formData.room,
        selectedDays: formData.selectedDays,
        timeSlot: formData.timeSlot,
        schedule: scheduleString,
        semester: formData.semester,
        academicYear: formData.academicYear || new Date().getFullYear().toString(),
        status: "active",
        attendanceRate: 0,
        totalSessions: 0,
        createdAt: new Date().toISOString(),
        createdBy: user.identifier,
        students: [],
      }

      // Save to localStorage
      const updatedClasses = [...existingClasses, newClass]
      localStorage.setItem("classes", JSON.stringify(updatedClasses))

      // Update teacher's classes
      const updatedTeachers = teachers.map((t) =>
        t.id.toString() === formData.teacherId ? { ...t, classes: [...(t.classes || []), newClass.classCode] } : t,
      )
      localStorage.setItem("teachers", JSON.stringify(updatedTeachers))

      setMessage({
        type: "success",
        text: `Class "${formData.className}" created successfully! Class Code: ${formData.classCode}`,
      })

      // Reset form
      setFormData({
        className: "",
        classCode: "",
        department: "",
        teacherId: "",
        description: "",
        credits: "",
        maxStudents: "",
        room: "",
        selectedDays: [],
        timeSlot: "",
        semester: "",
        academicYear: "",
      })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create class. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDaySelection = (dayId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayId)
        ? prev.selectedDays.filter((id) => id !== dayId)
        : [...prev.selectedDays, dayId],
    }))
  }

  const filteredTeachers = teachers.filter((teacher) =>
    formData.department ? teacher.department === formData.department : true,
  )

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
              <h1 className="text-2xl font-bold text-gray-900">Add New Class</h1>
              <p className="text-gray-600">Create a new class for the department</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Create New Class</CardTitle>
            <CardDescription>Fill in the details to create a new class</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name *</Label>
                    <Input
                      id="className"
                      type="text"
                      placeholder="Computer Science 101"
                      value={formData.className}
                      onChange={(e) => setFormData((prev) => ({ ...prev, className: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classCode">Class Code *</Label>
                    <Input
                      id="classCode"
                      type="text"
                      placeholder="CS101"
                      value={formData.classCode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, classCode: e.target.value.toUpperCase() }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the class..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits *</Label>
                    <Input
                      id="credits"
                      type="number"
                      placeholder="3"
                      min="1"
                      max="6"
                      value={formData.credits}
                      onChange={(e) => setFormData((prev) => ({ ...prev, credits: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Max Students *</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      placeholder="50"
                      min="1"
                      max="200"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData((prev) => ({ ...prev, maxStudents: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room">Room</Label>
                    <Input
                      id="room"
                      type="text"
                      placeholder="Room 101"
                      value={formData.room}
                      onChange={(e) => setFormData((prev) => ({ ...prev, room: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Department and Teacher */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Assignment</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value, teacherId: "" }))}
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
                    <Label htmlFor="teacherId">Assign Teacher *</Label>
                    <Select
                      value={formData.teacherId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, teacherId: value }))}
                      disabled={!formData.department}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTeachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.fullName} ({teacher.employeeId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredTeachers.length === 0 && formData.department && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertDescription className="text-yellow-800">
                      No teachers found in the selected department. Please add teachers first.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Schedule</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Class Days *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {days.map((day) => (
                        <label key={day.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.selectedDays.includes(day.id)}
                            onChange={() => handleDaySelection(day.id)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{day.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">Time Slot *</Label>
                    <Select
                      value={formData.timeSlot}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, timeSlot: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fall">Fall</SelectItem>
                        <SelectItem value="spring">Spring</SelectItem>
                        <SelectItem value="summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      type="text"
                      placeholder="2024"
                      value={formData.academicYear}
                      onChange={(e) => setFormData((prev) => ({ ...prev, academicYear: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Class..." : "Create Class"}
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
