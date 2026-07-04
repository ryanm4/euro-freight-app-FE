import FormField from "@/components/shared/FormField"
import { IconPlus, IconTrash } from "@tabler/icons-react"
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
              <FormField
                label="Arrival Port"
                id={`port-${port.id}`}
                placeholder="Enter port name"
                value={port.value}
                onChange={(v) => updatePort(port.id, v)}
                className="flex-1"
              />
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
