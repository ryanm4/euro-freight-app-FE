"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CLIENT_TYPES } from "@/config/enum"
import { createClient } from "@/lib/api/clients"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function ClientForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [contactNo, setContactNo] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [status, setStatus] = useState("Active")
  const [type, setType] = useState(String(CLIENT_TYPES.FORWARDER))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter a client name")
      return
    }

    setIsSaving(true)
    const toastId = toast.loading("Creating client...")

    try {
      await createClient({
        name,
        address,
        contact_no: contactNo,
        contact_person: contactPerson,
        status,
        type: Number(type),
        created_by: "ryan", // Hardcoded ryan as per requirement
      })

      toast.success("Client created successfully!", { id: toastId })
      await queryClient.invalidateQueries({ queryKey: ["clients"] })
      router.push("/clients")
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message ?? "Failed to create client", { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="mx-auto space-y-6">
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-md"
          onClick={() => router.push("/clients")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" className="rounded-md" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>

      <div className="rounded-md border border-neutral-700 bg-neutral-900 p-6">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-100">
            Client Details
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Provide the required details to register a new client profile
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="name"
              className="text-xs font-medium text-foreground"
            >
              Client Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter Client Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
            />
          </div>

          {/* Contact Person */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="contact-person"
              className="text-xs font-medium text-foreground"
            >
              Contact Person
            </Label>
            <Input
              id="contact-person"
              placeholder="Enter Contact Person"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
            />
          </div>

          {/* Contact Number */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="contact-no"
              className="text-xs font-medium text-foreground"
            >
              Contact Number
            </Label>
            <Input
              id="contact-no"
              placeholder="Enter Contact Number"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="type"
              className="text-xs font-medium text-foreground"
            >
              Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger
                id="type"
                className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-neutral-900 text-zinc-100">
                {Object.entries(CLIENT_TYPES).map(([key, val]) => (
                  <SelectItem key={val} value={String(val)}>
                    {key.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          {/* Address */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label
              htmlFor="address"
              className="text-xs font-medium text-foreground"
            >
              Address
            </Label>
            <Textarea
              id="address"
              placeholder="Enter Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="min-h-[80px] rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
            />
          </div>
        </div>
      </div>
    </form>
  )
}
