"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconUpload, IconX, IconFileText } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { UploadPackingList } from "@/lib/api/packing_lists"
import { usePackingListContext } from "@/contexts/packing-list-context"

interface UploadedFile {
  file: File
  id: string
}

interface PackingListUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PackingListUploadDialog({
  open,
  onOpenChange,
}: PackingListUploadDialogProps) {
  const router = useRouter()
  const { setUploadedData } = usePackingListContext()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const newFile: UploadedFile = {
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      }
      setUploadedFiles([newFile])
    }
  }

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) return

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("packing_list", uploadedFiles[0].file)

      const response = await UploadPackingList(formData)

      // Store the uploaded data in context
      setUploadedData(response)

      onOpenChange(false)
      setUploadedFiles([])

      router.push("/packing-list/create")
    } catch (error) {
      console.error(error)
      // toast("Failed to upload packing list");
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Packing List</DialogTitle>
          <DialogDescription>
            Upload your packing list files to create a new packing list entry.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* File Upload Area */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="file-upload"
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                uploadedFiles.length > 0
                  ? "cursor-not-allowed border-muted-foreground/10 bg-muted/30 opacity-50"
                  : "border-muted-foreground/25 bg-muted/50 hover:border-muted-foreground/50 hover:bg-muted/70"
              }`}
            >
              <IconUpload className="mb-2 h-10 w-10 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {uploadedFiles.length > 0
                  ? "File uploaded - remove to upload another"
                  : "Click to upload file"}
              </span>
              <span className="text-xs text-muted-foreground/70">
                {uploadedFiles.length === 0 && "or drag and drop"}
              </span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadedFiles.length > 0}
              />
            </label>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Uploaded Files</span>
              <div className="flex flex-col gap-2">
                {uploadedFiles.map((uploadedFile) => (
                  <div
                    key={uploadedFile.id}
                    className="flex items-center justify-between rounded-md border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      <IconFileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {uploadedFile.file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(uploadedFile.file.size)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveFile(uploadedFile.id)}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={uploadedFiles.length === 0 || isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
