"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { parsePurchaseOrderExcel } from "@/lib/api/purchase-orders"
import {
  IconFileSpreadsheet,
  IconLoader2,
  IconUpload,
} from "@tabler/icons-react"
import { useRef, useState } from "react"

interface PurchaseOrderImportUploadProps {
  onImported: (data: any, file: File) => void
}

export default function PurchaseOrderImportUpload({
  onImported,
}: PurchaseOrderImportUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const validateAndStage = (selected: File | undefined | null) => {
    if (!selected) return
    setError(null)

    const isXlsx =
      selected.name.toLowerCase().endsWith(".xlsx") ||
      selected.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    if (!isXlsx) {
      setError("Only .xlsx files are supported.")
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    setFile(selected)
    setConfirmOpen(true)
  }

  const resetSelection = () => {
    setFile(null)
    setConfirmOpen(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleConfirmUpload = async () => {
    if (!file) return
    try {
      setIsUploading(true)
      setError(null)
      const data = await parsePurchaseOrderExcel(file)
      onImported(data, file)
    } catch (err) {
      console.error(err)
      setError("We couldn't process that file. Please try again.")
      setConfirmOpen(false)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mx-auto flex h-full min-h-[70vh] w-full max-w-xl flex-col items-center justify-center">
      <div
        className={`flex w-full flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed p-10 text-center transition-colors ${
          isDragging
            ? "border-zinc-500 bg-zinc-800/50"
            : "border-neutral-700 bg-neutral-900"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          validateAndStage(e.dataTransfer.files?.[0])
        }}
      >
        <IconFileSpreadsheet className="h-10 w-10 text-zinc-500" />
        <div>
          <p className="text-sm font-medium text-zinc-100">
            Upload a Purchase Order file
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Drag and drop an .xlsx file here, or click below to browse.
            We&apos;ll use it to prefill the form.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="sr-only"
          onChange={(e) => validateAndStage(e.target.files?.[0])}
        />

        <Button
          variant="outline"
          size="sm"
          className="mt-1 gap-1.5 rounded-md border-zinc-700 bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          onClick={() => inputRef.current?.click()}
        >
          <IconUpload className="h-3.5 w-3.5" />
          Choose File
        </Button>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (isUploading) return
          setConfirmOpen(open)
          if (!open) resetSelection()
        }}
      >
        <AlertDialogContent className="border-neutral-700 bg-neutral-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">
              Upload {file?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              We&apos;ll parse this file and prefill the purchase order form
              with its contents. You can review and edit everything before
              saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUploading} onClick={resetSelection}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isUploading}
              onClick={(e) => {
                e.preventDefault() // keep dialog open while uploading
                handleConfirmUpload()
              }}
            >
              {isUploading ? (
                <span className="flex items-center gap-1.5">
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </span>
              ) : (
                "Upload"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
