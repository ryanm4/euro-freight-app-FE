"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createUser } from "@/lib/api/users"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function UsersForm() {
  const router = useRouter()

  const [isSaving, setIsSaving] = useState(false)
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")

  const handleSave = async () => {
    if (!username || !email || !password || !fullName) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const userData = {
        full_name: fullName,
        username: username,
        email: email,
        password: password,
        phone: phone,
      }

      await createUser(userData)
      toast.success("User created successfully!")
      router.push("/settings/user-management?tab=users")
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to create user.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto space-y-5">
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          className="rounded-md"
          onClick={() => router.push("/settings/user-management?tab=users")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button className="rounded-md" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-1">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              User Details
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Provide the user details below.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="full-name"
                  className="text-xs font-medium text-foreground"
                >
                  Full Name *
                </Label>
                <Input
                  id="full-name"
                  placeholder="Enter Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="username"
                  className="text-xs font-medium text-foreground"
                >
                  Username *
                </Label>
                <Input
                  id="username"
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-foreground"
                >
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-foreground"
                >
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label
                  htmlFor="phone"
                  className="text-xs font-medium text-foreground"
                >
                  Phone
                </Label>
                <Input
                  id="phone"
                  placeholder="Enter Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
