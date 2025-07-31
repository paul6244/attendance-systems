"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2 } from "lucide-react"

type Role = "admin" | "teacher" | "student"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as Role) || "admin"

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    indexNumber: "",
    password: "",
  })

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [adminExists, setAdminExists] = useState(false)

  useEffect(() => {
    // Check if admin already exists
    if (role === "admin") {
      const admin = localStorage.getItem("admin")
      setAdminExists(!!admin)
    }
  }, [role])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (role === "admin") {
        if (adminExists) {
          setError("An admin account already exists.")
          setIsLoading(false)
          return
        }
        localStorage.setItem("admin", JSON.stringify(formData))
        router.push("/login")
      } else if (role === "teacher") {
        const existingTeachers = JSON.parse(localStorage.getItem("teachers") || "[]")
        const updatedTeachers = [...existingTeachers, { ...formData, status: "pending" }]
        localStorage.setItem("teachers", JSON.stringify(updatedTeachers))
        router.push("/login")
      } else {
        const existingStudents = JSON.parse(localStorage.getItem("students") || "[]")
        const updatedStudents = [...existingStudents, { ...formData, status: "active" }]
        localStorage.setItem("students", JSON.stringify(updatedStudents))
        router.push("/login")
      }
    } catch (err) {
      setError("Registration failed. Try again.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20">
                <Image
                  src="/department-logo.png"
                  alt="Department Logo"
                  fill
                  className="object-contain"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-logo.png"
                  }}
                />
              </div>
            </div>
            <CardTitle className="text-center text-xl font-bold capitalize">
              {role} Registration
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {role === "admin" && adminExists && (
              <Alert className="border-blue-200 bg-blue-50">
                <Building2 className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  An admin already exists. You cannot create another.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {role !== "student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </div>

              {role === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="indexNumber">Index Number</Label>
                  <Input
                    id="indexNumber"
                    name="indexNumber"
                    type="text"
                    value={formData.indexNumber}
                    onChange={handleChange}
                    placeholder="Enter student index number"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
