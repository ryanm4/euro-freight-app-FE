"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createRole } from "@/lib/api/roles"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RolesForm() {
  const router = useRouter()

  const [isSaving, setIsSaving] = useState(false)
  const [roleName, setRoleName] = useState("")
  const [description, setDescription] = useState("")

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const roleData = {
        role_name: roleName,
        description: description,
      }

      await createRole(roleData)
      router.push("/roles")
    } catch (error) {
      console.error(error)
      alert("Failed to save role.")
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
          onClick={() => router.push("/roles")}
          // disabled={isSaving}
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
              Role Details
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Provide the role details below.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="role-name"
                  className="text-xs font-medium text-foreground"
                >
                  Role Name
                </Label>
                <Input
                  id="role-name"
                  placeholder="Enter Role Name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="description"
                  className="text-xs font-medium text-foreground"
                >
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Enter Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
