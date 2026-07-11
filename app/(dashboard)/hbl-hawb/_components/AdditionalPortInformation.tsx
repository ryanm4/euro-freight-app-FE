import { IconPlus, IconTrash } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface Port {
  id: number
  value: string
}

export default function YourComponent() {
  const [ports, setPorts] = useState<Port[]>([{ id: 1, value: "" }])

  const addPort = () => {
    setPorts((prev) => [...prev, { id: Date.now(), value: "" }])
  }

  const removePort = (id: number) => {
    setPorts((prev) => prev.filter((p) => p.id !== id))
  }

  const updatePort = (id: number, value: string) => {
    setPorts((prev) => prev.map((p) => (p.id === id ? { ...p, value } : p)))
  }

  return (
    <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Additional Port Information
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Packing lists and carton quantities.
          </p>
        </div>
        <button
          onClick={addPort}
          className="flex items-center gap-1.5 rounded-md border border-neutral-600 bg-neutral-800 px-3 py-1.5 text-xs text-zinc-100 transition-colors hover:bg-neutral-700"
        >
          <IconPlus size={13} />
          Add Port
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {ports.map((port) => (
            <div key={port.id} className="flex items-end gap-2">
              <div className="flex flex-col gap-1.5 flex-1">
                <Label htmlFor={`port-${port.id}`} className="text-xs font-medium text-foreground">Arrival Port</Label>
                <Input
                  id={`port-${port.id}`}
                  placeholder="Enter port name"
                  value={port.value}
                  onChange={(e) => updatePort(port.id, e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <button
                onClick={() => removePort(port.id)}
                disabled={ports.length === 1}
                className="mb-0.5 flex items-center justify-center rounded-md border border-neutral-600 bg-neutral-800 p-2 text-zinc-400 transition-colors hover:bg-neutral-700 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <IconTrash size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
