import { IconCalendarFilled, IconPlus, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, isValid, parse } from "date-fns"
import { cn } from "@/lib/utils"

export interface FreightSplit {
  id: string
  method: FreightMethod
  quantity: string
  dispatchDate: string
}

type FreightMethod = "air" | "sea"

const FreightSplitSection = ({
  poQuantity,
  splits,
  onChange,
  readOnly = false,
}: {
  poQuantity: string
  splits: FreightSplit[]
  onChange: (splits: FreightSplit[]) => void
  readOnly?: boolean
}) => {
  const total = splits.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0)
  const poQty = parseInt(poQuantity) || 0
  const remaining = poQty - total
  const isAllocationValid = poQty > 0 && remaining === 0

  const addSplit = () => {
    onChange([
      ...splits,
      {
        id: crypto.randomUUID(),
        method: "sea",
        quantity: "",
        dispatchDate: "",
      },
    ])
  }

  const removeSplit = (id: string) => {
    onChange(splits.filter((s) => s.id !== id))
  }

  const updateSplit = (
    id: string,
    field: keyof FreightSplit,
    value: string
  ) => {
    onChange(splits.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  return (
    <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Order Quantity Split
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Divide the PO quantity across freight methods. Total must equal PO
            quantity.
          </p>
        </div>
        {!readOnly && (
          <Button
            onClick={addSplit}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-md border-zinc-700 bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          >
            <IconPlus className="h-3.5 w-3.5" /> Add Split
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {splits.map((split, index) => (
          <div
            key={split.id}
            className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3"
          >
            <div className="flex flex-col gap-1.5">
              {index === 0 && (
                <Label className="text-xs font-medium text-foreground">Freight Method</Label>
              )}
              <Select
                value={split.method}
                onValueChange={(v) => updateSplit(split.id, "method", v)}
              >
                <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                  <SelectItem value="air">Air</SelectItem>
                  <SelectItem value="sea">Sea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              {index === 0 && (
                <Label htmlFor={`split-qty-${split.id}`} className="text-xs font-medium text-foreground">Quantity</Label>
              )}
              <Input
                id={`split-qty-${split.id}`}
                placeholder="Enter Quantity"
                value={split.quantity}
                onChange={(e) => updateSplit(split.id, "quantity", e.target.value)}
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              {index === 0 && (
                <Label htmlFor={`split-date-${split.id}`} className="text-xs font-medium text-foreground">Dispatch Date</Label>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id={`split-date-${split.id}`}
                    variant="outline"
                    disabled={readOnly}
                    className={cn(
                      "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                      !split.dispatchDate && "text-zinc-500"
                    )}
                  >
                    {split.dispatchDate ? (() => {
                      const parseDate = (val: string): Date | undefined => {
                        if (!val) return undefined
                        let d = parse(val, "yyyy-MM-dd HH:mm:ss", new Date())
                        if (isValid(d)) return d
                        d = parse(val, "yyyy-MM-dd", new Date())
                        if (isValid(d)) return d
                        d = new Date(val)
                        if (isValid(d)) return d
                        return undefined
                      }
                      const selectedDate = parseDate(split.dispatchDate)
                      return selectedDate ? format(selectedDate, "PPP") : "Pick a date"
                    })() : "Pick a date"}
                    <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={(() => {
                      const parseDate = (val: string): Date | undefined => {
                        if (!val) return undefined
                        let d = parse(val, "yyyy-MM-dd HH:mm:ss", new Date())
                        if (isValid(d)) return d
                        d = parse(val, "yyyy-MM-dd", new Date())
                        if (isValid(d)) return d
                        d = new Date(val)
                        if (isValid(d)) return d
                        return undefined
                      }
                      return parseDate(split.dispatchDate)
                    })()}
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        updateSplit(split.id, "dispatchDate", format(selectedDate, "yyyy-MM-dd"))
                      }
                    }}
                    captionLayout="dropdown"
                    disabled={readOnly}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {!readOnly && (
              <Button
                onClick={() => removeSplit(split.id)}
                variant="ghost"
                size="icon"
                className="mb-0 h-9 w-9 text-zinc-500 hover:text-red-400"
                disabled={splits.length === 1}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Summary row */}
      {poQty > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-md border border-neutral-700 bg-neutral-800/50 px-4 py-2.5">
          <div className="flex gap-6 text-xs">
            <span className="text-zinc-400">
              PO Quantity:{" "}
              <span className="font-semibold text-zinc-100">{poQty}</span>
            </span>
            <span className="text-zinc-400">
              Allocated:{" "}
              <span className="font-semibold text-zinc-100">{total}</span>
            </span>
            <span className="text-zinc-400">
              Remaining:{" "}
              <span
                className={`font-semibold ${remaining === 0 ? "text-green-400" : remaining < 0 ? "text-red-400" : "text-yellow-400"}`}
              >
                {remaining}
              </span>
            </span>
          </div>
          <span
            className={`text-xs font-medium ${isAllocationValid ? "text-green-400" : "text-yellow-400"}`}
          >
            {isAllocationValid ? "✓ Fully allocated" : "Allocation incomplete"}
          </span>
        </div>
      )}
    </div>
  )
}

export default FreightSplitSection
