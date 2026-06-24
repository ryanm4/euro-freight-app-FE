import { Input } from "../ui/input"
import { Label } from "../ui/label"

const FormField = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  className = "",
  type = "text",
}: {
  label: string
  id: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  className?: string
  type?: string
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
      />
    </div>
  )
}

export default FormField