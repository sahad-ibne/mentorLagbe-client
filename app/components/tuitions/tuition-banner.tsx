import type { ReactNode } from "react"
import Image from "next/image"

interface TuitionBannerProps {
  src: string
  alt: string
  children?: ReactNode
}

export function TuitionBanner({ src, alt, children }: TuitionBannerProps) {
  return (
    <div className="relative h-60 w-full overflow-hidden bg-slate-900 sm:h-72">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 66vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-slate-950/35"
      />
      {children}
    </div>
  )
}
