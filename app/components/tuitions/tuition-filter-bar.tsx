"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RotateCcw, Search } from "lucide-react"

interface TuitionFilterBarProps {
  initialSearch?: string
  initialSubject?: string
  initialClassLevel?: string
  initialMode?: string
}

export function TuitionFilterBar({
  initialSearch = "",
  initialSubject = "",
  initialClassLevel = "",
  initialMode = "all",
}: TuitionFilterBarProps) {
  const router = useRouter()

  const [search, setSearch] = useState(initialSearch)
  const [subject, setSubject] = useState(initialSubject)
  const [classLevel, setClassLevel] = useState(initialClassLevel)
  const [mode, setMode] = useState(initialMode || "all")

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()

    if (search.trim()) params.set("q", search.trim())
    if (subject.trim()) params.set("subject", subject.trim())
    if (classLevel.trim()) params.set("classLevel", classLevel.trim())
    if (mode && mode !== "all") params.set("mode", mode)

    const qs = params.toString()
    router.push(qs ? `/browse-tutions?${qs}` : "/browse-tutions")
  }

  const handleReset = () => {
    setSearch("")
    setSubject("")
    setClassLevel("")
    setMode("all")
    router.push("/browse-tutions")
  }

  return (
    <form
      onSubmit={applyFilters}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by title, location, or tutor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl border-slate-200 pl-9 focus-visible:ring-indigo-600"
          />
        </div>

        <Input
          placeholder="Subject (e.g. Math, Physics)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10 rounded-xl border-slate-200 focus-visible:ring-indigo-600"
        />

        <Input
          placeholder="Class (e.g. HSC, SSC, Class 8)"
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
          className="h-10 rounded-xl border-slate-200 focus-visible:ring-indigo-600"
        />

        <Select
          value={mode}
          onValueChange={(value) => setMode(value ?? "all")}
        >
          <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 focus:ring-indigo-600">
            <SelectValue placeholder="All Modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-1.5 rounded-xl border-slate-200 text-slate-600"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
        <Button
          type="submit"
          size="sm"
          className="gap-1.5 rounded-xl bg-indigo-600 px-4 text-white hover:bg-indigo-700"
        >
          <Search className="size-3.5" />
          Search & Filter
        </Button>
      </div>
    </form>
  )
}
