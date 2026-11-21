"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface ApplyTuitionButtonProps {
  tuitionTitle?: string
}

export function ApplyTuitionButton({ tuitionTitle }: ApplyTuitionButtonProps) {
  const [notice, setNotice] = useState("")

  const handleClick = () => {
    setNotice(
      tuitionTitle
        ? `Apply action ready for "${tuitionTitle}".`
        : "Apply action ready."
    )
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleClick}
        className="h-11 w-full gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        <Send className="size-4" />
        Apply for Tuition
      </Button>

      {notice && (
        <p className="text-center text-xs font-medium text-indigo-600">
          {notice}
        </p>
      )}
    </div>
  )
}
