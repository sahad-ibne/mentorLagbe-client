"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FcGoogle } from "react-icons/fc"
import {
  Eye,
  EyeOff,
  BookOpen,
  ClipboardCheck,
  Award,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

export default function SignInPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!email.trim() || !password) {
      setErrorMsg("Email and password are required.")
      return
    }

    setLoading(true)
    try {
      const data = {
        email: email.trim().toLowerCase(),
        password,
      }

      const { data: authData, error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/",
      })

      if (error) {
        setErrorMsg(error.message || "Invalid email or password.")
      } else if (authData) {
        router.push("/")
        router.refresh()
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.")
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
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-100/80 px-3 py-6 sm:px-6 sm:py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl sm:rounded-3xl lg:grid-cols-12">
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 px-5 py-3.5 text-white lg:hidden">
          <span className="text-xs font-semibold tracking-wide text-indigo-200">
            MentorLagbe
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px]">
            <ClipboardCheck className="h-3 w-3 text-emerald-300" />
            Study & Assessment
          </span>
        </div>
        <div className="flex flex-col justify-center bg-white p-5 sm:p-10 lg:col-span-7 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Sign In
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Enter your credentials to access your dashboard.
            </p>

            <div className="mt-5 sm:mt-6">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="h-10 w-full rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 sm:h-11"
              >
                <FcGoogle className="mr-2 h-5 w-5 shrink-0" />
                Sign in with Google
              </Button>
            </div>

            <div className="relative my-5 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase sm:text-xs">
                <span className="bg-white px-3 font-medium text-slate-400">
                  or continue with email
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600 sm:text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-3.5 sm:space-y-4">
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
                  className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white sm:h-11"
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50/50 pr-10 text-sm focus:bg-white sm:h-11"
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
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-600 sm:mt-6 sm:text-sm">
              Don't have an account yet?{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 p-8 text-white lg:col-span-5 lg:flex">
          <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 left-0 h-52 w-52 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-indigo-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              MentorLagbe
            </div>
            <h2 className="mt-4 text-2xl leading-snug font-bold">
              Keep Up With Books & Assessments.
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-indigo-200/85">
              Access shared study materials, track test scores, and stay aligned
              with your mentor.
            </p>
          </div>

          <div className="relative z-10 my-6 space-y-2.5">
            <div className="flex items-center justify-between rounded-xl border border-amber-300/25 bg-amber-400/15 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-amber-300" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    Syllabus & Reference Books
                  </p>
                  <p className="text-[11px] text-amber-100/80">
                    Annotated Chapters & Notes
                  </p>
                </div>
              </div>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                Books
              </span>
            </div>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-emerald-300" />
                <span className="text-xs font-semibold text-white">
                  Latest Assessment
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                <Award className="h-3 w-3" /> Graded
              </span>
            </div>
            <p className="mt-2.5 text-xs text-indigo-100/90">
              “Strong grasp of core problems; focus on timed practice sets next
              week.”
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
