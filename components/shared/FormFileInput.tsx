import { useState } from "react"
import { Label } from "../ui/label"

const FormFileInput = ({ label, id }: { label: string; id: string }) => {
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-700 bg-[#0A0A0A] px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700"
        >
          Choose File
        </label>
        <input
          id={id}
          type="file"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        <span className="truncate text-xs text-neutral-500">
          {fileName ?? "No file chosen"}
        </span>
      </div>
    </div>
  )
}

export default FormFileInput
