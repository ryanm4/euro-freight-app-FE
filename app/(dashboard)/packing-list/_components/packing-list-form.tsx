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
import { PurchaseOrderApi } from "@/modules/purchase-order/api"
import { PURCHASE_ORDER } from "@/modules/purchase-order/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconCalendarFilled, IconSearch } from "@tabler/icons-react"
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
}

export default function PackingListForm({
  uploadedData,
}: PackingListFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [pos, setPos] = useState<PURCHASE_ORDER[]>([])
  const [isPosLoading, setIsPosLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [uploadedItemsCurrentPage, setUploadedItemsCurrentPage] = useState(1)
  const itemsPerPage = 5
  const uploadedItemsPerPage = 10


  const baseDefaultValues: PackingListFormValues = {
    client_id: 0,
    manufacturer_id: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    document_date: format(new Date(), "yyyy-MM-dd"),
    ship_to: "",
    shipping_mode: "",
    total_volume: "",
    status: "DRAFT",
    created_by: "ryan",
    items: [],
    additional_info: "",
  }

  const form = useForm<PackingListFormValues>({
    resolver: zodResolver(packingListSchema),
    defaultValues: baseDefaultValues,
    shouldUnregister: false,
  })

  const renderFormField = <TName extends FieldPath<PackingListFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<PackingListFormValues, TName>
    >["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />

  const fetchPOs = useCallback(async () => {
    try {
      setIsPosLoading(true)
      const response = await PurchaseOrderApi.getAll()
      if (response.status === 200) {
        const raw = response.data as unknown
        if (Array.isArray(raw)) {
          setPos(raw)
        } else if (raw && typeof raw === "object") {
          const obj = raw as Record<string, unknown>
          const extracted =
            obj.data ?? obj.purchase_orders ?? obj.results ?? obj.items
          setPos(
            Array.isArray(extracted) ? (extracted as PURCHASE_ORDER[]) : []
          )
        } else {
          setPos([])
        }
      }
    } catch (error) {
      console.error("Failed to fetch purchase orders", error)
    } finally {
      setIsPosLoading(false)
    }
  }, [])

  const { data } = useQuery({
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

  useEffect(() => {
    fetchPOs()
  }, [fetchPOs])

  const activePOs = useMemo(() => {
    return pos.filter((po) => !po.packing_list_id)
  }, [pos])

  const selectedClientId = form.watch("client_id")
  const selectedClient = useMemo(() => {
    return clientOptions.find(
      (c: any) => String(c.id) === String(selectedClientId)
    )
  }, [clientOptions, selectedClientId])

  const filteredPOs = useMemo(() => {
    let result = activePOs

    if (selectedClient) {
      result = result.filter(
        (po) =>
          po.supplier_id &&
          String(po.supplier_id).toLowerCase() ===
            selectedClient.name.toLowerCase()
      )
    }

    if (searchQuery) {
      result = result.filter(
        (po) =>
          po.po_number &&
          po.po_number.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return result
  }, [activePOs, selectedClient, searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedClientId])

  const paginatedPOs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPOs.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPOs, currentPage])

  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage)

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

  const handleSelectItem = (po: PURCHASE_ORDER) => {
    const currentItems = form.getValues("items") || []
    const existingIndex = currentItems.findIndex(
      (item) => item.poNumber === po.po_number
    )

    let newItems
    if (existingIndex >= 0) {
      newItems = currentItems.filter((item) => item.poNumber !== po.po_number)
    } else {
      newItems = [
        ...currentItems,
        {
          poNumber: po.po_number || "",
          sku: po.sku || "",
          itemDescription: po.item_description || "",
          size: po.size || "",
          unitCost: po.unit_cost || 0,
          quantity: po.po_quantity || 0,
          ctnCount: po.carton_count || 0,
          grossWeightKg: po.gross_weight || 0,
          netWeightKg: po.net_weight || 0,
          cartonDimensions: po.carton_dimensions || "",
          cbm: po.cbm || 0,
        },
      ]
    }

    form.setValue("items", newItems, { shouldValidate: true })
  }

  const handleSelectUploadedItem = (
    uploadedItem: UploadedPackingListData["items"][0]
  ) => {
    const currentItems = form.getValues("items") || []
    const existingIndex = currentItems.findIndex(
      (item) =>
        item.poNumber === uploadedItem.poNumber &&
        item.sku === uploadedItem.sku
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

      const response = await fetch("/api/packing-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: Number(data.client_id),
          manufacturer_id: Number(data.manufacturer_id),
          date: data.date,
          document_date: data.document_date,
          ship_to: data.ship_to,
          shipping_mode: data.shipping_mode,
          total_volume: data.total_volume,
          status: "DRAFT",
          created_by: data.created_by,
          items: allItems,
          additional_info: data.additional_info || "",
        }),
      })

      const resData = await response.json()

      if (response.ok) {
        toast.success("Packing list created successfully!")
        router.push("/packing-list")
      } else {
        toast.error(resData.message || "Failed to create packing list")
      }
    } catch (error) {
      console.error("Error creating packing list:", error)
      toast.error("Failed to create packing list due to a server error")
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
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Packing List"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Card 1: Create Packing List */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md mb-2 font-medium">
                  Create Packing List
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

                {renderFormField("date", ({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Date</FormLabel>
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
                              field.onChange(
                                format(selectedDate, "yyyy-MM-dd")
                              )
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
                              field.onChange(
                                format(selectedDate, "yyyy-MM-dd")
                              )
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
                      value={field.value}
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
              </CardContent>
            </Card>

            {/* Card 2: Active Purchase Orders / Uploaded Items */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex flex-col gap-[0.5px]">
                  <h3 className="text-md font-medium">
                    {uploadedData ? "Uploaded Items" : "Active Purchase Orders"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {uploadedData
                      ? `Items from ${uploadedData.filename}`
                      : "overview of the active orders"}
                  </p>
                </div>
                {!uploadedData && (
                  <div className="relative w-[280px]">
                    <IconSearch className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search Purchase Order"
                      className="h-9 w-full pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto rounded-md border border-border">
                  <Table className="min-w-[900px]">
                    <TableHeader>
                      <TableRow>
                        {uploadedData ? (
                          <>
                            <TableHead className="min-w-[120px]">PO Number</TableHead>
                            <TableHead className="min-w-[80px]">SKU</TableHead>
                            <TableHead className="min-w-[150px]">Item Name</TableHead>
                            <TableHead className="min-w-[80px]">Color</TableHead>
                            <TableHead className="min-w-[70px]">Size</TableHead>
                            <TableHead className="min-w-[80px]">Quantity</TableHead>
                            <TableHead className="min-w-[100px]">Carton Count</TableHead>
                            <TableHead className="min-w-[130px]">Gross Weight (kg)</TableHead>
                            <TableHead className="min-w-[120px]">Net Weight (kg)</TableHead>
                            <TableHead className="min-w-[150px]">Carton Dimensions</TableHead>
                            <TableHead className="min-w-[70px]">CBM</TableHead>

                          </>
                        ) : (
                          <>
                            <TableHead className="min-w-[120px]">PO Number</TableHead>
                            <TableHead className="min-w-[110px]">Order Quantity</TableHead>
                            <TableHead className="min-w-[120px]">EX Factory Date</TableHead>
                            <TableHead className="min-w-[120px]">Shipping Mode</TableHead>
                            <TableHead className="min-w-[140px]">Final Destination</TableHead>
                            <TableHead className="min-w-[100px]">Supplier ID</TableHead>
                            <TableHead className="min-w-[150px]">Cargo Dispatch Date</TableHead>
                            <TableHead className="min-w-[80px]">Status</TableHead>

                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadedData ? (
                        uploadedData.items.length > 0 ? (
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
                              <TableCell>
                                {item.itemName || "N/A"}
                              </TableCell>
                              <TableCell>{item.color || "N/A"}</TableCell>
                              <TableCell>{item.size || "N/A"}</TableCell>
                              <TableCell>{item.quantity ?? 0}</TableCell>
                              <TableCell>{item.ctn ?? 0}</TableCell>
                              <TableCell>{item.grossWeightKg ?? 0}</TableCell>
                              <TableCell>{item.netWeightKg ?? 0}</TableCell>
                              <TableCell>
                                {item.ctnDemi || "N/A"}
                              </TableCell>
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
                        )
                      ) : isPosLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 9 }).map((_, j) => (
                              <TableCell key={j}>
                                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : paginatedPOs.length > 0 ? (
                        paginatedPOs.map((po) => (
                          <TableRow
                            key={po.id}
                            onClick={() => handleSelectItem(po)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              selectedItems.some(
                                (item) => item.poNumber === po.po_number
                              )
                                ? "bg-primary/10 hover:bg-primary/15"
                                : "hover:bg-muted/50"
                            )}
                          >
                            <TableCell className="font-medium">
                              {po.po_number || "N/A"}
                            </TableCell>
                            <TableCell>{po.po_quantity ?? 0}</TableCell>
                            <TableCell>
                              {po.ex_factory_date
                                ? format(
                                    new Date(po.ex_factory_date),
                                    "dd MMM yyyy"
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>{po.shipping_mode || "N/A"}</TableCell>
                            <TableCell>
                              {po.final_destination || "N/A"}
                            </TableCell>
                            <TableCell>{po.supplier_id || "N/A"}</TableCell>
                            <TableCell>
                              {po.cargo_dispatch_date
                                ? format(
                                    new Date(po.cargo_dispatch_date),
                                    "dd MMM yyyy"
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                status={po.status || "Pending"}
                                type="PURCHASE_ORDER"
                              />
                            </TableCell>

                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="h-24 text-center text-sm text-muted-foreground"
                          >
                            {selectedClientId
                              ? "No active purchase orders found for this client."
                              : "No active purchase orders. Please select a client name."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {uploadedData && uploadedItemsTotalPages > 1 && (
                  <div className="flex items-center justify-between py-2">
                    <div className="text-xs text-muted-foreground">
                      Showing{" "}
                      {(uploadedItemsCurrentPage - 1) * uploadedItemsPerPage +
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
                        {Array.from({ length: uploadedItemsTotalPages }).map(
                          (_, idx) => {
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
                          }
                        )}
                        <PaginationItem>
                          {uploadedItemsCurrentPage < uploadedItemsTotalPages ? (
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

                {!uploadedData && totalPages > 1 && (
                  <div className="flex items-center justify-between py-2">
                    <div className="text-xs text-muted-foreground">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, filteredPOs.length)}{" "}
                      of {filteredPOs.length} entries
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 &&
                            pageNum <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          )
                        }
                        if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return (
                            <span
                              key={pageNum}
                              className="px-1 text-muted-foreground"
                            >
                              ...
                            </span>
                          )
                        }
                        return null
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
                {!uploadedData && form.formState.errors.items && (
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
