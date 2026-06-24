import { IconPlus, IconTrash } from "@tabler/icons-react"
import FormDateField from "../shared/FormDateField"
import FormField from "../shared/FormField"
import FormSelect from "../shared/FormSelect"
import { Button } from "../ui/button"

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
  const isValid = poQty > 0 && remaining === 0

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
            <FormSelect
              label={index === 0 ? "Freight Method" : ""}
              value={split.method}
              onValueChange={(v) => updateSplit(split.id, "method", v)}
              placeholder="Select Method"
              options={[
                { value: "air", label: "Air" },
                { value: "sea", label: "Sea" },
              ]}
              // disabled={readOnly}
            />
            <FormField
              label={index === 0 ? "Quantity" : ""}
              id={`split-qty-${split.id}`}
              placeholder="Enter Quantity"
              value={split.quantity}
              onChange={(v) => updateSplit(split.id, "quantity", v)}
              // disabled={readOnly}
            />
            <FormDateField
              label={index === 0 ? "Dispatch Date" : ""}
              id={`split-date-${split.id}`}
              value={split.dispatchDate}
              onChange={(v) => updateSplit(split.id, "dispatchDate", v)}
              disabled={readOnly}
            />
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
            className={`text-xs font-medium ${isValid ? "text-green-400" : "text-yellow-400"}`}
          >
            {isValid ? "✓ Fully allocated" : "Allocation incomplete"}
          </span>
        </div>
      )}
    </div>
  )
}

export default FreightSplitSection
