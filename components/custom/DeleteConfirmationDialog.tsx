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
import { cn } from "@/lib/utils"
import { useState } from "react"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  itemType?: string // e.g. "purchase order", "user" — defaults to "item"
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
  className?: string
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemName,
  itemType = "item",
  onConfirm,
  isLoading = false,
  className,
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const busy = isLoading || isDeleting

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn("border-zinc-800 bg-[#0A0A0A] text-zinc-100", className)}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-zinc-100">
            Delete {itemType}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            This will permanently delete{" "}
            <span className="font-medium text-zinc-200">
              &quot;{itemName}&quot;
            </span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={busy}
            className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleConfirm}
              disabled={busy}
              className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
            >
              {busy ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
