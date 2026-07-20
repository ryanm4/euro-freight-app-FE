"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { fetchClients } from "@/lib/api/clients"
import { fetchPackingListById, updatePackingList } from "@/lib/api/packing_lists"
import { SHIPPING_MODE_OPTIONS } from "@/lib/constants"
import { UserRole } from "@/lib/enums/user-role"
import { cn } from "@/lib/utils"
import { CLIENT_LIST } from "@/modules/clients/types"
import { PurchaseOrderApi } from "@/modules/purchase-order/api"
import { PURCHASE_ORDER } from "@/modules/purchase-order/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconCalendarFilled, IconSearch } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { FieldPath, SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

// Edit-specific schema (no created_by, uses updated_by)
const editPackingListSchema = z.object({
  client_id: z.number().min(1, "Client should be selected"),
  manufacturer_id: z.number().min(1, "Manufacturer should be selected"),
  date: z.string().min(1, "Date is required"),
  document_date: z.string().min(1, "Document Date is required"),
  ship_to: z.string().min(1, "Ship To is required"),
  shipping_mode: z.string().min(1, "Shipping Mode is required"),
  total_volume: z.string().min(1, "Total Volume is required"),
  additional_info: z.string().optional(),
  items: z
    .array(
      z.object({
        poNumber: z.string().min(1, "PO Number is required"),
        sku: z.string().min(1, "SKU is required"),
        itemDescription: z.string().min(1, "Item Description is required"),
        size: z.string().min(1, "Size is required"),
        unitCost: z.number().min(0, "Unit Cost cannot be negative"),
        quantity: z.number().positive("Quantity must be greater than 0"),
        ctnCount: z.number().positive("Carton Count must be greater than 0"),
        grossWeightKg: z.number().positive("Gross Weight must be greater than 0"),
        netWeightKg: z.number().positive("Net Weight must be greater than 0"),
        cartonDimensions: z.string().min(1, "Carton Dimensions are required"),
        cbm: z.number().positive("CBM must be greater than 0"),
      })
    )
    .min(1, "At least one item is required"),
})

type EditPackingListFormValues = z.infer<typeof editPackingListSchema>

export default function PLByID() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [pos, setPos] = useState<PURCHASE_ORDER[]>([])
  const [isPosLoading, setIsPosLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const {
    data: res,
    isLoading: isFetching,
    isError,
  } = useQuery({
    queryKey: ["packing-list", id],
    queryFn: () => fetchPackingListById(id),
  })

  const form = useForm<EditPackingListFormValues>({
    resolver: zodResolver(editPackingListSchema),
    defaultValues: {
      client_id: 0,
      manufacturer_id: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      document_date: format(new Date(), "yyyy-MM-dd"),
      ship_to: "",
      shipping_mode: "",
      total_volume: "",
      additional_info: "",
      items: [],
    },
  })

  // Populate form once data loads
  useEffect(() => {
    if (!res?.data) return
    const d = res.data
    form.reset({
      client_id: d.client_id ?? 0,
      manufacturer_id: d.manufacturer_id ?? 0,
      date: d.date
        ? d.date.includes(" ")
          ? d.date.split(" ")[0]
          : d.date
        : format(new Date(), "yyyy-MM-dd"),
      document_date: d.document_date
        ? d.document_date.includes(" ")
          ? d.document_date.split(" ")[0]
          : d.document_date
        : format(new Date(), "yyyy-MM-dd"),
      ship_to: d.ship_to ?? "",
      shipping_mode: d.shipping_mode ?? "",
      total_volume: d.total_volume ? String(d.total_volume) : "",
      additional_info: d.additional_info ?? "",
      items: Array.isArray(d.items)
        ? d.items.map((item: any) => ({
            poNumber: item.poNumber ?? item.po_number ?? "",
            sku: item.sku ?? "",
            itemDescription: item.itemDescription ?? item.item_description ?? "",
            size: item.size ?? "",
            unitCost: item.unitCost ?? item.unit_cost ?? 0,
            quantity: item.quantity ?? 0,
            ctnCount: item.ctnCount ?? item.ctn_count ?? item.ctn ?? 0,
            grossWeightKg: item.grossWeightKg ?? item.gross_weight_kg ?? 0,
            netWeightKg: item.netWeightKg ?? item.net_weight_kg ?? 0,
            cartonDimensions:
              item.cartonDimensions ?? item.carton_dimensions ?? item.ctnDemi ?? "",
            cbm: item.cbm ?? 0,
          }))
        : [],
    })
  }, [res])

  const renderFormField = <TName extends FieldPath<EditPackingListFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<EditPackingListFormValues, TName>
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

  const { data: clientsData } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const clientOptions = useMemo(
    () =>
      clientsData?.data?.filter(
        (c: any) => c.type === UserRole.Client
      ) || [],
    [clientsData]
  )

  const manufacturerOptions = useMemo(
    () =>
      clientsData?.data?.filter(
        (c: any) => c.type === UserRole.Supplier
      ) || [],
    [clientsData]
  )

  useEffect(() => {
    fetchPOs()
  }, [fetchPOs])

  const activePOs = useMemo(() => pos.filter((po) => !po.packing_list_id), [pos])

  const selectedClientId = form.watch("client_id")

  const filteredPOs = useMemo(() => {
    let result = activePOs
    if (searchQuery) {
      result = result.filter(
        (po) =>
          po.po_number &&
          po.po_number.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return result
  }, [activePOs, searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const paginatedPOs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredPOs.slice(start, start + itemsPerPage)
  }, [filteredPOs, currentPage])

  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage)
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

  const onSubmit: SubmitHandler<EditPackingListFormValues> = async (data) => {
    try {
      setIsLoading(true)
      await updatePackingList(id, {
        client_id: Number(data.client_id),
        manufacturer_id: Number(data.manufacturer_id),
        date: data.date,
        document_date: data.document_date,
        ship_to: data.ship_to,
        shipping_mode: data.shipping_mode,
        total_volume: data.total_volume,
        updated_by: "ryan",
        gdn_id: null,
        grn_id: null,
        items: data.items,
      })
      toast.success("Packing list updated successfully!")
      router.push("/packing-list")
    } catch (error) {
      console.error("Error updating packing list:", error)
      toast.error("Failed to update packing list")
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

  if (isFetching) {
    return (
      <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !res?.data) {
    return (
      <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
        <p className="text-sm text-destructive">Packing list not found.</p>
      </div>
    )
  }

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Edit Packing List"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Packing Lists", href: "/packing-list" },
        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 pb-0"
        >
          <div className="flex w-full items-center justify-end gap-4">
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Card 1: Packing List Details */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md mb-2 font-medium">Edit Packing List</h3>
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
                          onSelect={(d) => {
                            if (d) field.onChange(format(d, "yyyy-MM-dd"))
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
                          onSelect={(d) => {
                            if (d) field.onChange(format(d, "yyyy-MM-dd"))
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
                    <Select value={field.value} onValueChange={field.onChange}>
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

            {/* Card 2: Selected Items */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex flex-col gap-[0.5px]">
                  <h3 className="text-md font-medium">Items</h3>
                  <p className="text-xs text-muted-foreground">
                    Items currently on this packing list
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected / existing items table */}
                {selectedItems.length > 0 && (
                  <div className="overflow-hidden rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>PO Number</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Item Description</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Carton Count</TableHead>
                          <TableHead>Gross Weight (kg)</TableHead>
                          <TableHead>Net Weight (kg)</TableHead>
                          <TableHead>Carton Dimensions</TableHead>
                          <TableHead>CBM</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedItems.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">
                              {item.poNumber || "N/A"}
                            </TableCell>
                            <TableCell>{item.sku || "N/A"}</TableCell>
                            <TableCell>
                              {item.itemDescription || "N/A"}
                            </TableCell>
                            <TableCell>{item.size || "N/A"}</TableCell>
                            <TableCell>{item.quantity ?? 0}</TableCell>
                            <TableCell>{item.ctnCount ?? 0}</TableCell>
                            <TableCell>{item.grossWeightKg ?? 0}</TableCell>
                            <TableCell>{item.netWeightKg ?? 0}</TableCell>
                            <TableCell>
                              {item.cartonDimensions || "N/A"}
                            </TableCell>
                            <TableCell>{item.cbm ?? 0}</TableCell>
                            <TableCell className="text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = selectedItems.filter(
                                    (_, i) => i !== idx
                                  )
                                  form.setValue("items", updated, {
                                    shouldValidate: true,
                                  })
                                }}
                                className="text-xs text-destructive hover:underline"
                              >
                                Remove
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Add from Active POs */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Add from Active Purchase Orders
                    </p>
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
                  </div>
                  <div className="overflow-hidden rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>PO Number</TableHead>
                          <TableHead>Order Quantity</TableHead>
                          <TableHead>EX Factory Date</TableHead>
                          <TableHead>Shipping Mode</TableHead>
                          <TableHead>Final Destination</TableHead>
                          <TableHead>Supplier ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isPosLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                              {Array.from({ length: 8 }).map((_, j) => (
                                <TableCell key={j}>
                                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : paginatedPOs.length > 0 ? (
                          paginatedPOs.map((po) => (
                            <TableRow key={po.id}>
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
                              <TableCell>
                                {po.shipping_mode || "N/A"}
                              </TableCell>
                              <TableCell>
                                {po.final_destination || "N/A"}
                              </TableCell>
                              <TableCell>{po.supplier_id || "N/A"}</TableCell>
                              <TableCell>
                                <StatusBadge
                                  status={po.status || "Pending"}
                                  type="PURCHASE_ORDER"
                                />
                              </TableCell>
                              <TableCell className="pr-4 text-right">
                                <Checkbox
                                  checked={selectedItems.some(
                                    (item) => item.poNumber === po.po_number
                                  )}
                                  onCheckedChange={() => handleSelectItem(po)}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="h-24 text-center text-sm text-muted-foreground"
                            >
                              No active purchase orders found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between py-2">
                      <div className="text-xs text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredPOs.length
                        )}{" "}
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
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
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
                </div>

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
