"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { fetchClients } from "@/lib/api/clients"
import { SHIPPING_MODE_OPTIONS } from "@/lib/constants"
import { UserRole } from "@/lib/enums/user-role"
import { cn } from "@/lib/utils"
import { CLIENT_LIST } from "@/modules/clients/types"
import { packingListSchema } from "@/modules/packing-list/validation"
import { PackingListStatus } from "@/modules/packing-list/types"
import { PurchaseOrderApi } from "@/modules/purchase-order/api"
import { PURCHASE_ORDER } from "@/modules/purchase-order/types"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  IconCalendarFilled,
  IconSearch,
  IconUpload,
  IconX,
  IconFileText,
} from "@tabler/icons-react"
import { UploadPackingList } from "@/lib/api/packing_lists"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { FieldPath, SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

type PackingListFormValues = z.infer<typeof packingListSchema>

interface UploadedPackingListData {
  success: boolean
  filename: string
  pages: number
  rowCount: number
  rowsFailedToParse: number
  totals: {
    totalQuantity: number
    totalCartons: number
    totalGrossWeight: number
    totalNetWeight: number
    totalCbm: number
  }
  items: Array<{
    ctnNo?: number
    poNumber: string
    sku: string
    itemName: string
    color?: string
    size: string
    co?: string
    unitCost: number
    quantity: number
    ctn: number
    grossWeightKg: number
    netWeightKg: number
    ctnDemi: string
    cbm: number
  }>
  parseErrors: Array<{
    rowIndex: number
    poNumber: string
    rawChunk: string
  }>
}

interface PackingListFormProps {
  uploadedData?: UploadedPackingListData | null
  initialData?: any | null
  mode?: "create" | "edit"
  packingListId?: string
}

export default function PackingListForm({
  uploadedData: initialUploadedData,
  initialData,
  mode = "create",
  packingListId,
}: PackingListFormProps) {
  const router = useRouter()
  const [uploadedData, setUploadedData] =
    useState<UploadedPackingListData | null>(initialUploadedData || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedItemsCurrentPage, setUploadedItemsCurrentPage] = useState(1)
  const uploadedItemsPerPage = 10

  const baseDefaultValues: PackingListFormValues = {
    client_id: 0,
    manufacturer_id: 0,
    forwarder_id: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    document_date: format(new Date(), "yyyy-MM-dd"),
    ship_to: "",
    shipping_mode: "",
    total_volume: "",
    status: PackingListStatus.DRAFT,
    created_by: "ryan",
    items: [],
    additional_info: "",
  }

  const form = useForm<PackingListFormValues>({
    resolver: zodResolver(packingListSchema),
    defaultValues: baseDefaultValues,
    shouldUnregister: false,
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      try {
        setIsUploading(true)
        const formData = new FormData()
        formData.append("packing_list", file)

        const response = await UploadPackingList(formData)
        setUploadedData(response)
        toast.success("Packing list uploaded and parsed successfully!")
      } catch (error) {
        console.error(error)
        toast.error("Failed to upload packing list. Please try again.")
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleRemoveFile = () => {
    setUploadedData(null)
    form.setValue("items", [], { shouldValidate: true })
  }

  const renderFormField = <TName extends FieldPath<PackingListFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<PackingListFormValues, TName>
    >["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />

  const { data, isSuccess: isClientsLoaded } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const clientOptions = useMemo(() => {
    return (
      data?.data?.filter((client: any) => client.type === UserRole.Client) || []
    )
  }, [data])

  const manufacturerOptions = useMemo(() => {
    return (
      data?.data?.filter((client: any) => client.type === UserRole.Supplier) ||
      []
    )
  }, [data])

  const forwarderOptions = useMemo(() => {
    return (
      data?.data?.filter((client: any) => client.type === UserRole.Forwarder) ||
      []
    )
  }, [data])

  // Auto-populate all items from uploaded data when arriving from the upload flow
  useEffect(() => {
    if (uploadedData && uploadedData.items.length > 0) {
      const autoItems = uploadedData.items.map((item) => ({
        poNumber: item.poNumber,
        sku: item.sku,
        itemDescription: item.itemName,
        size: item.size,
        unitCost: item.unitCost,
        quantity: item.quantity,
        ctnCount: item.ctn,
        grossWeightKg: item.grossWeightKg,
        netWeightKg: item.netWeightKg,
        cartonDimensions: item.ctnDemi,
        cbm: item.cbm,
      }))
      form.setValue("items", autoItems, { shouldValidate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedData])

  const normalizeShippingMode = (val?: string | null) => {
    if (!val) return ""
    const lower = val.toLowerCase()
    if (lower === "lcl") return "LCL"
    if (lower === "fcl") return "FCL"
    if (lower === "air") return "AIR"
    return val
  }

  useEffect(() => {
    if (initialData) {
      if (!isClientsLoaded) return

      const matchedClient = clientOptions.find(
        (c: any) => c.name === initialData.client_name
      )
      const clientId = matchedClient
        ? matchedClient.id
        : Number(initialData.client_id) || 0

      const matchedManufacturer = manufacturerOptions.find(
        (m: any) => m.name === initialData.manufacturer_name
      )
      const manufacturerId = matchedManufacturer
        ? matchedManufacturer.id
        : Number(initialData.manufacturer_id) || 0

      const mappedFormItems = (initialData.items || []).map((item: any) => ({
        poNumber: item.poNumber || item.po_number || "",
        sku: item.sku || "",
        itemDescription:
          item.itemDescription || item.item_name || item.itemName || "",
        size: item.size || "",
        unitCost: Number(item.unitCost) || 0,
        quantity: Number(item.quantity) || 0,
        ctnCount: Number(item.ctnCount || item.ctn_count || item.ctn) || 0,
        grossWeightKg: Number(item.grossWeightKg || item.gross_weight_kg) || 0,
        netWeightKg: Number(item.netWeightKg || item.net_weight_kg) || 0,
        cartonDimensions: item.cartonDimensions || item.ctnDemi || "",
        cbm: Number(item.cbm) || 0,
      }))

      form.reset({
        client_id: clientId,
        manufacturer_id: manufacturerId,
        date: initialData.date
          ? format(new Date(initialData.date), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        document_date: initialData.document_date
          ? format(new Date(initialData.document_date), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        ship_to: initialData.ship_to || "",
        shipping_mode: normalizeShippingMode(initialData.shipping_mode),
        total_volume: initialData.total_volume || "",
        status: initialData.status || PackingListStatus.DRAFT,
        created_by: initialData.created_by || "ryan",
        items: mappedFormItems,
        additional_info: initialData.additional_info || "",
      })

      if (initialData.items && initialData.items.length > 0) {
        const mappedUploadedItems = mappedFormItems.map((item: any) => ({
          poNumber: item.poNumber,
          sku: item.sku,
          itemName: item.itemDescription,
          size: item.size,
          unitCost: item.unitCost,
          quantity: item.quantity,
          ctn: item.ctnCount,
          grossWeightKg: item.grossWeightKg,
          netWeightKg: item.netWeightKg,
          ctnDemi: item.cartonDimensions,
          cbm: item.cbm,
        }))

        const totalQuantity = mappedUploadedItems.reduce(
          (acc: number, item: any) => acc + Number(item.quantity || 0),
          0
        )
        const totalCartons = mappedUploadedItems.reduce(
          (acc: number, item: any) => acc + Number(item.ctn || 0),
          0
        )
        const totalGrossWeight = mappedUploadedItems.reduce(
          (acc: number, item: any) => acc + Number(item.grossWeightKg || 0),
          0
        )
        const totalNetWeight = mappedUploadedItems.reduce(
          (acc: number, item: any) => acc + Number(item.netWeightKg || 0),
          0
        )
        const totalCbm = mappedUploadedItems.reduce(
          (acc: number, item: any) => acc + Number(item.cbm || 0),
          0
        )

        setUploadedData({
          success: true,
          filename: initialData.packing_list_no || "Existing File",
          pages: 1,
          rowCount: mappedUploadedItems.length,
          rowsFailedToParse: 0,
          totals: {
            totalQuantity,
            totalCartons,
            totalGrossWeight,
            totalNetWeight,
            totalCbm,
          },
          items: mappedUploadedItems,
          parseErrors: [],
        })
      }
    }
  }, [initialData, form, clientOptions, manufacturerOptions, isClientsLoaded])

  const uploadedItemsTotalPages = uploadedData
    ? Math.ceil(uploadedData.items.length / uploadedItemsPerPage)
    : 0

  const paginatedUploadedItems = uploadedData
    ? uploadedData.items.slice(
        (uploadedItemsCurrentPage - 1) * uploadedItemsPerPage,
        uploadedItemsCurrentPage * uploadedItemsPerPage
      )
    : []

  const selectedItems = form.watch("items") || []

  const handleSelectUploadedItem = (
    uploadedItem: UploadedPackingListData["items"][0]
  ) => {
    const currentItems = form.getValues("items") || []
    const existingIndex = currentItems.findIndex(
      (item) =>
        item.poNumber === uploadedItem.poNumber && item.sku === uploadedItem.sku
    )

    let newItems
    if (existingIndex >= 0) {
      newItems = currentItems.filter(
        (item) =>
          !(
            item.poNumber === uploadedItem.poNumber &&
            item.sku === uploadedItem.sku
          )
      )
    } else {
      newItems = [
        ...currentItems,
        {
          poNumber: uploadedItem.poNumber,
          sku: uploadedItem.sku,
          itemDescription: uploadedItem.itemName,
          size: uploadedItem.size,
          unitCost: uploadedItem.unitCost,
          quantity: uploadedItem.quantity,
          ctnCount: uploadedItem.ctn,
          grossWeightKg: uploadedItem.grossWeightKg,
          netWeightKg: uploadedItem.netWeightKg,
          cartonDimensions: uploadedItem.ctnDemi,
          cbm: uploadedItem.cbm,
        },
      ]
    }

    form.setValue("items", newItems, { shouldValidate: true })
  }

  const onSubmit: SubmitHandler<PackingListFormValues> = async (data) => {
    try {
      setIsLoading(true)

      // Read items directly from form state — items are set via setValue
      // (not registered via <FormField>), so we prefer getValues() over data.items.
      const formItems = form.getValues("items") ?? data.items ?? []
      const allItems = formItems.map((item) => ({
        poNumber: item.poNumber,
        sku: item.sku || "",
        itemName: item.itemDescription || "",
        size: item.size || "",
        unitCost: item.unitCost || 0,
        quantity: item.quantity || 0,
        ctnCount: item.ctnCount || 0,
        grossWeightKg: item.grossWeightKg || 0,
        netWeightKg: item.netWeightKg || 0,
        cartonDimensions: item.cartonDimensions || "",
        cbm: item.cbm || 0,
      }))

      const url =
        mode === "edit"
          ? `/api/packing_lists/${packingListId}`
          : "/api/packing-list"
      const method = mode === "edit" ? "PUT" : "POST"

      const payload: any = {
        client_id: Number(data.client_id),
        manufacturer_id: Number(data.manufacturer_id),
        forwarder_id: Number(data.forwarder_id),
        date: format(new Date(), "yyyy-MM-dd"),
        document_date: data.document_date,
        ship_to: data.ship_to,
        shipping_mode: data.shipping_mode,
        total_volume: data.total_volume,
        status: data.status || PackingListStatus.DRAFT,
        items: allItems,
        additional_info: data.additional_info || "",
      }

      if (mode === "edit") {
        payload.updated_by = "ruwan"
        payload.gdn_id = initialData?.gdn_id ?? null
        payload.grn_id = initialData?.grn_id ?? null
      } else {
        payload.created_by = data.created_by || "ryan"
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const resData = await response.json()

      if (response.ok) {
        toast.success(
          mode === "edit"
            ? "Packing list updated successfully!"
            : "Packing list created successfully!"
        )
        router.push("/packing-list")
      } else {
        toast.error(
          resData.message ||
            `Failed to ${mode === "edit" ? "update" : "create"} packing list`
        )
      }
    } catch (error) {
      console.error(
        `Error ${mode === "edit" ? "updating" : "creating"} packing list:`,
        error
      )
      toast.error(
        `Failed to ${mode === "edit" ? "update" : "create"} packing list due to a server error`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateValue = (val?: string) => {
    if (!val) return ""
    try {
      const parsable = val.includes(" ") ? val.replace(" ", "T") : val
      return format(new Date(parsable), "PPP")
    } catch {
      return val
    }
  }

  const getCalendarSelectedDate = (val?: string) => {
    if (!val) return undefined
    try {
      const parsable = val.includes(" ") ? val.replace(" ", "T") : val
      return new Date(parsable)
    } catch {
      return undefined
    }
  }

  if (mode === "edit" && !isClientsLoaded) {
    return (
      <div className="mx-auto space-y-5">
        <div className="mt-6 flex w-full items-center justify-end gap-[16px] sm:justify-end">
          <div className="h-10 w-24 animate-pulse rounded bg-muted" />
          <div className="h-10 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="h-96 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto space-y-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error("Packing list form validation errors:", errors)
            const fieldNames = Object.keys(errors).join(", ")
            toast.error(`Please fix the following fields: ${fieldNames}`)
          })}
          className="space-y-6 pb-0"
        >
          <div className="mt-6 flex w-full items-center justify-end gap-[16px] sm:justify-end">
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={() => router.push("/packing-list")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              type="submit"
              className="bg-primary text-white"
              disabled={isLoading || isUploading || !uploadedData}
            >
              {isLoading ? "Saving..." : mode === "edit" ? "Update" : "Save"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Card 1: Create/Edit Packing List */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md mb-2 font-medium">
                  {mode === "edit"
                    ? "Edit Packing List"
                    : "Create Packing List"}
                </h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Important dates, documents, and shipment instructions.
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4 md:grid-cols-2">
                {renderFormField("client_id", ({ field }: { field: any }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Client Name</FormLabel>
                    <Select
                      key={field.value}
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                        <SelectValue placeholder="Select Client Name" />
                      </SelectTrigger>
                      <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                        {clientOptions.map((c: CLIENT_LIST) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField(
                  "manufacturer_id",
                  ({ field }: { field: any }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="mb-1">Manufacturer Name</FormLabel>
                      <Select
                        key={field.value}
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                          <SelectValue placeholder="Select Manufacturer Name" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                          {manufacturerOptions.map((m: CLIENT_LIST) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                )}

                {renderFormField(
                  "forwarder_id",
                  ({ field }: { field: any }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="mb-1">Forwarder Name</FormLabel>
                      <Select
                        key={field.value}
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                          <SelectValue placeholder="Select Forwarder Name" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                          {forwarderOptions.map((m: CLIENT_LIST) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                )}

                {renderFormField("date", ({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled
                            type="button"
                            variant="outline"
                            className={cn(
                              "h-9 w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? formatDateValue(field.value)
                              : format(new Date(), "PPP")}
                            <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={getCalendarSelectedDate(field.value)}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              field.onChange(format(selectedDate, "yyyy-MM-dd"))
                            }
                          }}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("document_date", ({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Document Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "h-9 w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? formatDateValue(field.value)
                              : format(new Date(), "PPP")}
                            <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={getCalendarSelectedDate(field.value)}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              field.onChange(format(selectedDate, "yyyy-MM-dd"))
                            }
                          }}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("ship_to", ({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Ship To</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Ship To"
                        {...field}
                        className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("shipping_mode", ({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Shipping Mode</FormLabel>
                    <Select
                      key={field.value}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                        <SelectValue placeholder="Select Shipping Mode" />
                      </SelectTrigger>
                      <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                        {SHIPPING_MODE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("total_volume", ({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Total Volume</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Total Volume"
                        {...field}
                        className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
                {mode === "edit" &&
                  renderFormField("status", ({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="mb-1">Status</FormLabel>
                      <Select
                        key={field.value}
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                          {Object.values(PackingListStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  ))}
              </CardContent>
            </Card>

            {/* Totals — shown when items come from an uploaded file */}
            {uploadedData && (
              <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-col gap-[0.5px]">
                  <h3 className="text-md mb-2 font-medium">Totals</h3>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Aggregated quantities from the uploaded file.
                  </p>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Total Quantity
                    </label>
                    <input
                      readOnly
                      value={uploadedData.totals.totalQuantity}
                      className="h-9 w-full rounded-md border border-zinc-700 bg-[#0A0A0A] px-3 text-sm text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Total Cartons
                    </label>
                    <input
                      readOnly
                      value={uploadedData.totals.totalCartons}
                      className="h-9 w-full rounded-md border border-zinc-700 bg-[#0A0A0A] px-3 text-sm text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Total Gross Weight (kg)
                    </label>
                    <input
                      readOnly
                      value={uploadedData.totals.totalGrossWeight}
                      className="h-9 w-full rounded-md border border-zinc-700 bg-[#0A0A0A] px-3 text-sm text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Total Net Weight (kg)
                    </label>
                    <input
                      readOnly
                      value={uploadedData.totals.totalNetWeight}
                      className="h-9 w-full rounded-md border border-zinc-700 bg-[#0A0A0A] px-3 text-sm text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Total CBM
                    </label>
                    <input
                      readOnly
                      value={uploadedData.totals.totalCbm}
                      className="h-9 w-full rounded-md border border-zinc-700 bg-[#0A0A0A] px-3 text-sm text-zinc-100 outline-none"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card 2: Uploaded Items / Import Packing List */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex flex-col gap-[0.5px]">
                  <h3 className="text-md font-medium">
                    {uploadedData
                      ? "Uploaded Items"
                      : "Import Items from Packing List"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {uploadedData
                      ? `Items from ${uploadedData.filename}`
                      : "Please upload your packing list Excel file to import items."}
                  </p>
                </div>
                {uploadedData && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={handleRemoveFile}
                    className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <IconX className="mr-1 h-4 w-4" /> Remove File
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedData ? (
                  <>
                    <div className="overflow-x-auto rounded-md border border-border">
                      <Table className="min-w-[900px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[120px]">
                              PO Number
                            </TableHead>
                            <TableHead className="min-w-[80px]">SKU</TableHead>
                            <TableHead className="min-w-[150px]">
                              Item Name
                            </TableHead>
                            <TableHead className="min-w-[80px]">
                              Color
                            </TableHead>
                            <TableHead className="min-w-[70px]">Size</TableHead>
                            <TableHead className="min-w-[80px]">
                              Quantity
                            </TableHead>
                            <TableHead className="min-w-[100px]">
                              Carton Count
                            </TableHead>
                            <TableHead className="min-w-[130px]">
                              Gross Weight (kg)
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                              Net Weight (kg)
                            </TableHead>
                            <TableHead className="min-w-[150px]">
                              Carton Dimensions
                            </TableHead>
                            <TableHead className="min-w-[70px]">CBM</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadedData.items.length > 0 ? (
                            paginatedUploadedItems.map((item, index) => (
                              <TableRow
                                key={index}
                                onClick={() => handleSelectUploadedItem(item)}
                                className={cn(
                                  "cursor-pointer transition-colors",
                                  selectedItems.some(
                                    (selectedItem) =>
                                      selectedItem.poNumber === item.poNumber &&
                                      selectedItem.sku === item.sku
                                  )
                                    ? "bg-primary/10 hover:bg-primary/15"
                                    : "hover:bg-muted/50"
                                )}
                              >
                                <TableCell className="font-medium">
                                  {item.poNumber || "N/A"}
                                </TableCell>
                                <TableCell>{item.sku || "N/A"}</TableCell>
                                <TableCell>{item.itemName || "N/A"}</TableCell>
                                <TableCell>{item.color || "N/A"}</TableCell>
                                <TableCell>{item.size || "N/A"}</TableCell>
                                <TableCell>{item.quantity ?? 0}</TableCell>
                                <TableCell>{item.ctn ?? 0}</TableCell>
                                <TableCell>{item.grossWeightKg ?? 0}</TableCell>
                                <TableCell>{item.netWeightKg ?? 0}</TableCell>
                                <TableCell>{item.ctnDemi || "N/A"}</TableCell>
                                <TableCell>{item.cbm ?? 0}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={12}
                                className="h-24 text-center text-sm text-muted-foreground"
                              >
                                No items found in the uploaded file.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {uploadedItemsTotalPages > 1 && (
                      <div className="flex items-center justify-between py-2">
                        <div className="text-xs text-muted-foreground">
                          Showing{" "}
                          {(uploadedItemsCurrentPage - 1) *
                            uploadedItemsPerPage +
                            1}{" "}
                          to{" "}
                          {Math.min(
                            uploadedItemsCurrentPage * uploadedItemsPerPage,
                            uploadedData.items.length
                          )}{" "}
                          of {uploadedData.items.length} items
                        </div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              {uploadedItemsCurrentPage > 1 ? (
                                <PaginationPrevious
                                  onClick={() =>
                                    setUploadedItemsCurrentPage((p) =>
                                      Math.max(1, p - 1)
                                    )
                                  }
                                  className="cursor-pointer"
                                />
                              ) : (
                                <PaginationPrevious className="pointer-events-none opacity-50" />
                              )}
                            </PaginationItem>
                            {Array.from({
                              length: uploadedItemsTotalPages,
                            }).map((_, idx) => {
                              const pageNum = idx + 1
                              if (
                                pageNum === 1 ||
                                pageNum === uploadedItemsTotalPages ||
                                (pageNum >= uploadedItemsCurrentPage - 1 &&
                                  pageNum <= uploadedItemsCurrentPage + 1)
                              ) {
                                return (
                                  <PaginationItem key={pageNum}>
                                    <PaginationLink
                                      onClick={() =>
                                        setUploadedItemsCurrentPage(pageNum)
                                      }
                                      isActive={
                                        uploadedItemsCurrentPage === pageNum
                                      }
                                      className="cursor-pointer"
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                )
                              }
                              if (
                                pageNum === uploadedItemsCurrentPage - 2 ||
                                pageNum === uploadedItemsCurrentPage + 2
                              ) {
                                return (
                                  <PaginationItem key={pageNum}>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )
                              }
                              return null
                            })}
                            <PaginationItem>
                              {uploadedItemsCurrentPage <
                              uploadedItemsTotalPages ? (
                                <PaginationNext
                                  onClick={() =>
                                    setUploadedItemsCurrentPage((p) =>
                                      Math.min(uploadedItemsTotalPages, p + 1)
                                    )
                                  }
                                  className="cursor-pointer"
                                />
                              ) : (
                                <PaginationNext className="pointer-events-none opacity-50" />
                              )}
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-2 py-4">
                    <label
                      htmlFor="file-upload"
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                        isUploading
                          ? "cursor-not-allowed border-muted-foreground/10 bg-muted/30 opacity-50"
                          : "border-muted-foreground/25 bg-muted/50 hover:border-muted-foreground/50 hover:bg-muted/70"
                      }`}
                    >
                      <IconUpload className="mb-2 h-10 w-10 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {isUploading
                          ? "Uploading and parsing file..."
                          : "Click to upload packing list file"}
                      </span>
                      <span className="text-xs text-muted-foreground/70">
                        {!isUploading && "PDF files only (.pdf)"}
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                )}
                {form.formState.errors.items && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.items.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Card 3: Additional Information */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md mb-2 font-medium">
                  Additional Information
                </h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Packing lists and carton quantities.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("additional_info", ({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  )
}
