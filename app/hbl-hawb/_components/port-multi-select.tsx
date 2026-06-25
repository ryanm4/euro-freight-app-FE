"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { IconChevronDown, IconSearch, IconX } from "@tabler/icons-react"
import { useState } from "react"

interface Port {
  value: string
  label: string
  country?: string
  code?: string
}

interface PortMultiSelectProps {
  label: string
  selected: Port[]
  onChange: (ports: Port[]) => void
  ports: Port[]
  disabled?: boolean
}

export function PortMultiSelect({
  label,
  selected,
  onChange,
  ports,
  disabled = false,
}: PortMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = ports.filter(
    (p) =>
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase()) ||
      p.country?.toLowerCase().includes(search.toLowerCase())
  )

  const isSelected = (value: string) => selected.some((s) => s.value === value)

  const toggle = (port: Port) => {
    if (isSelected(port.value)) {
      onChange(selected.filter((s) => s.value !== port.value))
    } else {
      onChange([...selected, port])
    }
  }

  const remove = (value: string) => {
    onChange(selected.filter((s) => s.value !== value))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-foreground">{label}</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className="flex min-h-9 w-full items-center justify-between !rounded-sm border border-neutral-700 bg-[#0A0A0A] px-3 py-1.5 text-left text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex flex-1 flex-wrap gap-1">
              {selected.length === 0 ? (
                <span className="text-zinc-600">Choose Arrival Ports</span>
              ) : (
                selected.map((port) => (
                  <span
                    key={port.value}
                    className="inline-flex items-center gap-1 rounded-md bg-neutral-800 px-2 py-0.5 text-xs text-zinc-200"
                  >
                    {port.label}
                    {!disabled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          remove(port.value)
                        }}
                        className="text-zinc-500 hover:text-zinc-200"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
            <IconChevronDown className="ml-2 h-4 w-4 shrink-0 text-zinc-500" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[420px] rounded-md border-neutral-700 bg-[#0A0A0A] p-0"
          align="start"
        >
          {/* Search */}
          <div className="border-b border-neutral-800 p-2">
            <div className="relative">
              <IconSearch className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-zinc-500" />
              <Input
                placeholder="Search ports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 rounded-md border-neutral-700 bg-neutral-900 pl-8 text-xs text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[auto_1fr_100px_80px] items-center gap-3 border-b border-neutral-800 px-3 py-2">
            <div className="w-4" />
            <span className="text-xs font-medium text-zinc-500">Port Name</span>
            <span className="text-xs font-medium text-zinc-500">Code</span>
            <span className="text-xs font-medium text-zinc-500">Country</span>
          </div>

          {/* Port Rows */}
          <div className="max-h-[260px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No ports found.
              </div>
            ) : (
              filtered.map((port) => (
                <div
                  key={port.value}
                  onClick={() => toggle(port)}
                  className="grid cursor-pointer grid-cols-[auto_1fr_100px_80px] items-center gap-3 border-b border-neutral-800/50 px-3 py-2.5 last:border-0 hover:bg-neutral-800/50"
                >
                  <Checkbox
                    checked={isSelected(port.value)}
                    onCheckedChange={() => toggle(port)}
                    className="border-neutral-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm text-zinc-100">{port.label}</span>
                  <span className="text-xs text-zinc-400">
                    {port.code ?? "—"}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {port.country ?? "—"}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-neutral-800 px-3 py-2">
            <span className="text-xs text-zinc-500">
              {selected.length} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-zinc-400 hover:text-zinc-100"
              onClick={() => onChange([])}
            >
              Clear all
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
