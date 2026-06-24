import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

const FormTextarea = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) => {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-25 resize-none rounded-md border-neutral-700 bg-[#0A0A0A] text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500"
      />
    </div>
  )
}

export default FormTextarea
