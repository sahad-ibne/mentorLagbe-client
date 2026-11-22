import React from "react"
import Link from "next/link"
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react"

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/browse-tutions" },
  { label: "Pro Plans", href: "/pricing" },
  { label: "How It Works", href: "/#how-it-works" },
]

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-3.5"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const FacebookIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-4"
    aria-hidden="true"
  >
    <path d="M13.5 9H16V6h-2.5C11.57 6 10 7.57 10 9.5V11H8v3h2v7h3v-7h2.2l.8-3H13V9.5c0-.28.22-.5.5-.5z" />
  </svg>
)

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-3.5"
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const LinkedInIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-3.5"
    aria-hidden="true"
  >
    <path d="M6.94 8.5H4.2V19h2.74V8.5zM5.57 4.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM19.8 13.02c0-2.66-1.42-4.52-3.82-4.52-1.76 0-2.64.96-3.09 1.64V8.5h-2.73c.04.76 0 10.5 0 10.5h2.73v-5.86c0-.31.02-.63.12-.85.25-.63.83-1.28 1.8-1.28 1.27 0 1.78.97 1.78 2.39V19H20v-5.98h-.2z" />
  </svg>
)

export default function FooterPage() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-5 pt-14 pb-8 sm:px-7">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-400/30">
                <GraduationCap className="size-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Mentor<span className="text-indigo-400">Lagbe</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-6 text-slate-400">
              Connecting students and parents with trusted mentors for focused,
              effective learning across every class and subject.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <span className="size-1.5 rounded-full bg-indigo-400" />
              Verified Mentors &amp; Smart Matching
            </div>
          </div>
          <div className="space-y-3.5 lg:col-span-2">
            <h3 className="text-xs font-bold tracking-wider text-white uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center text-slate-400 transition hover:translate-x-0.5 hover:text-indigo-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3.5 lg:col-span-3">
            <h3 className="text-xs font-bold tracking-wider text-white uppercase">
              Contact Info
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a
                  href="mailto:support@mentorlagbe.com"
                  className="group flex items-center gap-2.5 transition hover:text-indigo-300"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-indigo-400 transition group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10">
                    <Mail className="size-3.5" />
                  </span>
                  <span className="truncate">support@mentorlagbe.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+8801700000000"
                  className="group flex items-center gap-2.5 transition hover:text-indigo-300"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-indigo-400 transition group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10">
                    <Phone className="size-3.5" />
                  </span>
                  <span>+880 1700-000000</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-indigo-400">
                  <MapPin className="size-3.5" />
                </span>
                <span className="leading-5">
                  Nasirabad, Chattogram, Bangladesh
                </span>
              </li>
            </ul>
          </div>
          <div className="space-y-3.5 lg:col-span-3">
            <h3 className="text-xs font-bold tracking-wider text-white uppercase">
              Follow Us
            </h3>
            <p className="text-sm leading-6 text-slate-400">
              Stay updated with new tuition openings, study tips, and platform
              updates.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="MentorLagbe on X"
                className="flex size-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:-translate-y-0.5 hover:border-indigo-500/50 hover:bg-indigo-600 hover:text-white"
              >
                <XIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="MentorLagbe on Facebook"
                className="flex size-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:-translate-y-0.5 hover:border-indigo-500/50 hover:bg-indigo-600 hover:text-white"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="MentorLagbe on Instagram"
                className="flex size-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:-translate-y-0.5 hover:border-indigo-500/50 hover:bg-indigo-600 hover:text-white"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="MentorLagbe on LinkedIn"
                className="flex size-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:-translate-y-0.5 hover:border-indigo-500/50 hover:bg-indigo-600 hover:text-white"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800/90 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {currentYear} MentorLagbe. All rights reserved.</p>
          <p className="text-slate-500">
            Built with care for students &amp; mentors.
          </p>
        </div>
      </div>
    </footer>
  )
}
