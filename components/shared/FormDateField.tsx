import { Input } from "../ui/input"
import { Label } from "../ui/label"

const FormDateField = ({
  label,
  id,
  value,
  onChange,
  disabled = false,
  className = "",
}: {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  className?: string
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-9 rounded-md border-neutral-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 [&::-webkit-calendar-picker-indicator]:invert"
      />
    </div>
  )
}

export default FormDateField
