"use client"

import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

const FormSelect = ({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  readOnly = false,
}: {
  label: string
  value: string
  onValueChange?: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  readOnly?: boolean
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        open={readOnly ? false : undefined}
        onOpenChange={(open) => {
          if (readOnly && open) return
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default FormSelect
