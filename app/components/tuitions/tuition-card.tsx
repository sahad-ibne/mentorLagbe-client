import Image from "next/image"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  MapPin,
  Wallet,
} from "lucide-react"

export interface TuitionItem {
  _id?: string
  id?: string
  title: string
  subject: string
  classLevel: string
  mode: "online" | "offline" | "hybrid" | string
  location: string
  monthlyFee: number
  daysPerWeek: number
  bannerImage?: string
  description?: string
  approvalStatus?: string
  status?: string
  isActive?: boolean
  tutorName?: string
  tutorEmail?: string
}

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"

export function TuitionCard({ tuition }: { tuition: TuitionItem }) {
  const id = tuition._id || tuition.id || ""
  const modeLabel = (tuition.mode || "offline").toLowerCase()

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-slate-200 bg-white shadow-xs transition hover:border-indigo-200 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <Image
          src={tuition.bannerImage?.trim() || DEFAULT_BANNER}
          alt={tuition.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 capitalize shadow-xs backdrop-blur-xs">
          {modeLabel}
        </span>
      </div>

      <CardHeader className="space-y-2 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-indigo-600">
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5">
            <BookOpen className="size-3.5" />
            {tuition.subject}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
            <GraduationCap className="size-3.5" />
            {tuition.classLevel}
          </span>
        </div>

        <CardTitle className="line-clamp-1 text-base font-bold text-slate-900">
          {tuition.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pt-0">
        {tuition.description && (
          <p className="line-clamp-2 text-xs leading-5 text-slate-500 sm:text-sm">
            {tuition.description}
          </p>
        )}

        <div className="space-y-1.5 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{tuition.location}</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
              <Wallet className="size-3.5 text-indigo-600" />৳
              {Number(tuition.monthlyFee || 0).toLocaleString()}/mo
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <CalendarDays className="size-3.5 text-slate-400" />
              {tuition.daysPerWeek} days/wk
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="truncate text-xs text-slate-500">
          {tuition.tutorName || "Verified Tutor"}
        </span>
        <Link href={id ? `/tuitions/${id}` : "/tuitions"}>
          <Button
            size="sm"
            className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
