"use client"

import { cn } from "@/lib/utils"
import { IconCalendarFilled } from "@tabler/icons-react"
import { format, isValid, parse } from "date-fns"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import { Label } from "../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

const FormDateField = ({
  label,
  id,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  className = "",
}: {
  label: string
  id: string
  value: string
  onChange?: (v: string) => void
  disabled?: boolean
  readOnly?: boolean
  className?: string
}) => {
  // Parse the stored string value (yyyy-MM-dd or yyyy-MM-dd HH:mm:ss) into a Date
const parseDate = (val: string): Date | undefined => {
  if (!val) return undefined

  // Try yyyy-MM-dd HH:mm:ss
  let d = parse(val, "yyyy-MM-dd HH:mm:ss", new Date())
  if (isValid(d)) return d

  // Try yyyy-MM-dd
  d = parse(val, "yyyy-MM-dd", new Date())
  if (isValid(d)) return d

  // Try native ISO parsing (handles "2026-07-30T18:30:00.000Z" etc.)
  d = new Date(val)
  if (isValid(d)) return d

  return undefined
}

  const selectedDate = parseDate(value)
  const displayLabel = selectedDate
    ? format(selectedDate, "PPP")
    : "Pick a date"

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={id} className="text-xs font-medium text-foreground">
          {label}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
              !value && "text-zinc-500",
              readOnly &&
                "cursor-default hover:bg-[#0A0A0A] hover:text-zinc-100"
            )}
          >
            {displayLabel}
            <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onChange && onChange(format(date, "yyyy-MM-dd"))
              }
            }}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default FormDateField
