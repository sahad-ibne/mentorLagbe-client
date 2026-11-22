"use client"

import { useState } from "react"
import { useSession, authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { ImagePlus, Loader2, Save, UserRound } from "lucide-react"

type ProfileUser = {
  id: string
  name: string
  email: string
  image?: string | null
  phone?: string | null
  bio?: string | null
}

function ProfileEditor({
  user,
  refreshSession,
}: {
  user: ProfileUser
  refreshSession: () => Promise<void>
}) {
  const [name, setName] = useState(user.name || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [bio, setBio] = useState(user.bio || "")
  const [imageUrl, setImageUrl] = useState(user.image || "")
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const previewUrl = (() => {
    try {
      const url = new URL(imageUrl.trim())
      return url.protocol === "https:" || url.protocol === "http:"
        ? url.href
        : ""
    } catch {
      return ""
    }
  })()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")

    if (!name.trim()) {
      setErrorMessage("Name is required.")
      return
    }

    if (imageUrl.trim() && !previewUrl) {
      setErrorMessage("Enter a valid image URL starting with http:// or https://.")
      return
    }

    setSaving(true)
    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        image: previewUrl || null,
      })

      if (error) {
        throw new Error(error.message)
      }

      await refreshSession()
      toast.add({
        type: "success",
        title: "Profile updated",
        description: "Your profile information has been saved.",
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update your profile."
      setErrorMessage(message)
      toast.add({
        type: "error",
        title: "Profile update failed",
        description: message,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-5 sm:p-7">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Update Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Keep your contact details and profile picture up to date.
        </p>
      </header>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {errorMessage}
        </p>
      )}

      <Card className="rounded-2xl border-slate-200 bg-white shadow-2xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Profile details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              {previewUrl ? (
                <div
                  role="img"
                  aria-label="Profile picture preview"
                  className="size-20 shrink-0 rounded-full border border-slate-200 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url("${previewUrl.replaceAll('"', "%22")}")`,
                  }}
                />
              ) : (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  {imageUrl.trim() ? (
                    <ImagePlus className="size-7" />
                  ) : (
                    <UserRound className="size-7" />
                  )}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Profile picture
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Paste an image URL below. Use a publicly accessible HTTP or
                  HTTPS image link.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                autoComplete="name"
                maxLength={100}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={user.email}
                readOnly
                className="bg-slate-50 text-slate-500"
              />
              <p className="text-xs text-slate-500">
                Email address cannot be changed here.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-image">Profile picture URL</Label>
              <Input
                id="profile-image"
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/your-photo.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-bio">Bio</Label>
              <textarea
                id="profile-bio"
                rows={5}
                maxLength={500}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Tell students a little about yourself."
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <p className="text-right text-xs text-slate-400">
                {bio.length}/500
              </p>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardProfilePage() {
  const { data: session, isPending, refetch } = useSession()

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin text-indigo-600" />
        Loading your profile...
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-3xl p-5 sm:p-7">
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Sign in to update your profile.
        </p>
      </div>
    )
  }

  const user = session.user as ProfileUser

  return (
    <ProfileEditor
      key={user.id}
      user={user}
      refreshSession={async () => {
        await refetch?.()
      }}
    />
  )
}
