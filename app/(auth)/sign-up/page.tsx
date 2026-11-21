"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FcGoogle } from "react-icons/fc"
import {
  Eye,
  EyeOff,
  UserCheck,
  Presentation,
  BookOpen,
  FileText,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { toast } from "@/components/ui/toast"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignUpPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"student" | "tutor">("tutor")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!fullName.trim()) return "Full Name is required."
    if (!email.trim()) return "Email is required."
    if (!EMAIL_REGEX.test(email.trim())) {
      return "Please enter a valid email address."
    }
    if (!password) return "Password is required."
    if (password.length < 8) {
      return "Password must be at least 8 characters long."
    }
    return ""
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    const validationError = validateForm()
    if (validationError) {
      setErrorMsg(validationError)
      toast.add({
        type: "error",
        title: "Sign-up failed",
        description: validationError,
      })
      return
    }

    setLoading(true)
    try {
      const data = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      }

      const signUpData = {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/",
        role,
        plan: "free",
      } as Parameters<typeof authClient.signUp.email>[0] & {
        role: "student" | "tutor"
        plan: "free"
      }

      const { data: authData, error } =
        await authClient.signUp.email(signUpData)

      if (error) {
        setErrorMsg(error.message || "Could not create account.")
        toast.add({
          type: "error",
          title: "Sign-up failed",
          description: error.message || "Could not create account.",
        })
      } else if (authData) {
        toast.add({
          type: "success",
          title: "Account created",
          description: "Your account was created successfully.",
        })
        router.push("/")
        router.refresh()
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.")
      toast.add({
        type: "error",
        title: "Sign-up failed",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setErrorMsg("")
    setLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      })
    } catch {
      setErrorMsg("Google sign-in failed. Please try again.")
      toast.add({
        type: "error",
        title: "Google sign-up failed",
        description: "Please try again.",
      })
      setLoading(false)
    }
  }

  const isTutor = role === "tutor"

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-100/80 px-3 py-6 sm:px-6 sm:py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl sm:rounded-3xl lg:grid-cols-12">
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 px-5 py-3.5 text-white lg:hidden">
          <span className="text-xs font-semibold tracking-wide text-indigo-200">
            MentorLagbe • Free Plan
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px]">
            {isTutor ? "Tutor: Up to 2 Posts" : "Student: Free + Notes"}
          </span>
        </div>
        <div className="flex flex-col justify-center bg-white p-5 sm:p-10 lg:col-span-7 lg:p-11">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Create Account
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Starts on the{" "}
              <span className="font-semibold text-slate-700">Free</span> plan —
              pick your role below.
            </p>

            <div className="mt-4 sm:mt-5">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="h-10 w-full rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 sm:h-11"
              >
                <FcGoogle className="mr-2 h-5 w-5 shrink-0" />
                Sign up with Google
              </Button>
            </div>

            <div className="relative my-4 sm:my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase sm:text-xs">
                <span className="bg-white px-3 font-medium text-slate-400">
                  or register with email
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600 sm:text-sm">
                {errorMsg}
              </div>
            )}

            <form
              onSubmit={handleSignUp}
              noValidate
              className="space-y-3 sm:space-y-3.5"
            >
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase sm:text-xs">
                  Select Role
                </Label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("tutor")}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition sm:p-3 ${
                      role === "tutor"
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Presentation
                      className={`h-5 w-5 shrink-0 ${
                        role === "tutor" ? "text-indigo-600" : "text-slate-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold">Tutor</p>
                      <p className="text-[11px] text-slate-500">2 free posts</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition sm:p-3 ${
                      role === "student"
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <UserCheck
                      className={`h-5 w-5 shrink-0 ${
                        role === "student"
                          ? "text-indigo-600"
                          : "text-slate-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold">Student</p>
                      <p className="text-[11px] text-slate-500">Free</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="fullName"
                  className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase sm:text-xs"
                >
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase sm:text-xs"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase sm:text-xs"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50/50 pr-10 text-sm focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-10 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 sm:h-11"
              >
                {loading
                  ? "Creating Account..."
                  : `Create ${isTutor ? "Tutor" : "Student"} Account`}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-600 sm:mt-5 sm:text-sm">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 p-8 text-white lg:col-span-5 lg:flex">
          <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 left-0 h-52 w-52 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-indigo-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Free Starter Plan
              </span>

              <div className="flex rounded-lg bg-white/10 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setRole("tutor")}
                  className={`rounded-md px-2.5 py-1 font-medium transition ${
                    isTutor
                      ? "bg-indigo-500 text-white"
                      : "text-indigo-200 hover:text-white"
                  }`}
                >
                  Tutor
                </button>
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`rounded-md px-2.5 py-1 font-medium transition ${
                    !isTutor
                      ? "bg-indigo-500 text-white"
                      : "text-indigo-200 hover:text-white"
                  }`}
                >
                  Student
                </button>
              </div>
            </div>

            {isTutor ? (
              <>
                <h2 className="mt-4 text-2xl leading-snug font-bold">
                  Post Tuitions & Share Class Notes.
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-indigo-200/85">
                  Start with 2 free tuition batch posts, review student
                  applications, and share study notes directly with your
                  learners.
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-2xl leading-snug font-bold">
                  Find Mentors & Collect Teacher Notes.
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-indigo-200/85">
                  Join free as a student, apply to matching tuitions, and access
                  notes & practice sheets shared by your teacher.
                </p>
              </>
            )}
          </div>
          <div className="relative z-10 my-5 space-y-2.5">
            {isTutor ? (
              <>
                <div className="rounded-xl border border-amber-300/25 bg-amber-400/15 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-4 w-4 text-amber-300" />
                      <span className="text-xs font-semibold text-white">
                        Free Tuition Post Limit
                      </span>
                    </div>
                    <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                      0 / 2 Used
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                    <div className="h-full w-1/4 rounded-full bg-amber-300" />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-indigo-300/25 bg-indigo-500/20 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-200" />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Teacher Notes & Handouts
                      </p>
                      <p className="text-[11px] text-indigo-200/80">
                        Upload lecture notes & chapter sheets
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-indigo-100">
                    Notes
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-xl border border-emerald-300/25 bg-emerald-400/15 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Notes From Your Teacher
                      </p>
                      <p className="text-[11px] text-emerald-100/80">
                        Chapter PDFs, formulas & class summaries
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                    Free
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-indigo-300/25 bg-indigo-500/20 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-indigo-200" />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Reference Books & Guides
                      </p>
                      <p className="text-[11px] text-indigo-200/80">
                        Curated study materials per subject
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-indigo-100">
                    Books
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-3.5 text-xs text-indigo-100/90 backdrop-blur-md">
            <div className="flex items-center gap-2 font-semibold text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              {isTutor
                ? "Tutor Free Plan: 2 Tuition Posts + Student Notes"
                : "Student Free Plan: Apply to Tuitions + Read Teacher Notes"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
