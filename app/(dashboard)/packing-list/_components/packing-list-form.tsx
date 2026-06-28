"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { packingListSchema } from "@/modules/packing-list/validation"
import { useCallback, useState, useEffect, useMemo } from "react"
import { FieldPath, useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { IconCalendarFilled, IconSearch } from "@tabler/icons-react"
import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"
import { Combobox } from "@/components/ui/combobox"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ClientApi } from "@/modules/clients/api"
import { CLIENT_LIST } from "@/modules/clients/types"
import { PURCHASE_ORDER } from "@/modules/purchase-order/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/shared/status-badge"
import { toast } from "sonner"
import { PurchaseOrderApi } from "@/modules/purchase-order/api"
import { packingListApi } from "@/modules/packing-list/api"
import { CREATE_PACKING_LIST } from "@/modules/packing-list/types"

export default function PackingListForm() {
  const router = useRouter()
  const [client, setClient] = useState<CLIENT_LIST[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pos, setPos] = useState<PURCHASE_ORDER[]>([])
  const [isPosLoading, setIsPosLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  type PackingListFormValues = z.infer<typeof packingListSchema>

  const baseDefaultValues: PackingListFormValues = {
    client_id: 0,
    date: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    created_by: "ryan",
    quantity: 0,
    po_detail_ids: [],
    additional_info: "",
  }

  const form = useForm<PackingListFormValues>({
    resolver: zodResolver(packingListSchema),
    defaultValues: baseDefaultValues,
  })

  const renderFormField = <TName extends FieldPath<PackingListFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<PackingListFormValues, TName>
    >["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />

  const fetchCustomerData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await ClientApi.getAll()
      if (response.status === 200) {
        // Backend may return a paginated/wrapped object or a plain array
        const raw = response.data as unknown
        if (Array.isArray(raw)) {
          setClient(raw)
        } else if (raw && typeof raw === "object") {
          // Try common wrapper keys: data, clients, results, items
          const obj = raw as Record<string, unknown>
          const extracted = obj.data ?? obj.clients ?? obj.results ?? obj.items
          setClient(
            Array.isArray(extracted) ? (extracted as CLIENT_LIST[]) : []
          )
        } else {
          setClient([])
        }
      }
    } catch (error) {
      console.error("Failed to fetch clients", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchPOs = useCallback(async () => {
    try {
      setIsPosLoading(true)
      const response = await PurchaseOrderApi.getAll()
      if (response.status === 200) {
        // Backend may return a paginated/wrapped object or a plain array
        const raw = response.data as unknown
        if (Array.isArray(raw)) {
          setPos(raw)
        } else if (raw && typeof raw === "object") {
          // Try common wrapper keys: data, purchase_orders, results, items
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

  useEffect(() => {
    fetchCustomerData()
    fetchPOs()
  }, [fetchCustomerData, fetchPOs])

  const activePOs = useMemo(() => {
    return pos.filter((po) => !po.packing_list_id)
  }, [pos])

  const selectedClientId = form.watch("client_id")
  const selectedClient = useMemo(() => {
    return client.find((c) => String(c.id) === String(selectedClientId))
  }, [client, selectedClientId])

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

  // Reset pagination if search or client changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedClientId])

  const paginatedPOs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPOs.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPOs, currentPage])

  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage)

  const selectedPoIds = form.watch("po_detail_ids") || []

  const handleSelectPo = (id: number) => {
    const currentSelected = form.getValues("po_detail_ids") || []
    let newSelected: number[]

    if (currentSelected.includes(id)) {
      newSelected = currentSelected.filter((item) => item !== id)
    } else {
      newSelected = [...currentSelected, id]
    }

    const totalQty = activePOs
      .filter((po) => newSelected.includes(po.id))
      .reduce((sum, po) => sum + (po.po_quantity || 0), 0)

    form.setValue("po_detail_ids", newSelected, { shouldValidate: true })
    form.setValue("quantity", totalQty, { shouldValidate: true })
  }

  async function onSubmit(values: PackingListFormValues) {
    try {
      setIsLoading(true)

      const payload: CREATE_PACKING_LIST = {
        client_id: Number(values.client_id),
        date: values.date,
        created_by: "User",
        quantity: values.quantity,
        po_detail_ids: values.po_detail_ids,
      }

      const response = await packingListApi.create({
        ...payload,
        client_id: String(payload.client_id),
      })

      if (response.status === 200 || response.status === 201) {
        toast.success("Packing List created successfully")
        router.push("/packing-list")
      }
    } catch (error) {
      console.error("Failed to create Packing List:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to create Packing List"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateValue = (val?: string) => {
    if (!val) return ""
    try {
      // Replace space with T to make it standard ISO parser friendly
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-0">
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
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {renderFormField("client_id", ({ field }: { field: any }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Client Name</FormLabel>
                    <Combobox
                      items={[
                        ...client.map((c: CLIENT_LIST) => ({
                          value: String(c.id),
                          label: c.name,
                        })),
                      ]}
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) => field.onChange(Number(val))}
                    />
                    <FormMessage />
                  </FormItem>
                ))}

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
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              field.onChange(
                                format(selectedDate, "yyyy-MM-dd HH:mm:ss")
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
              </CardContent>
            </Card>

            {/* Card 2: Active Purchase Orders */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex flex-col gap-[0.5px]">
                  <h3 className="text-md font-medium">
                    Active Purchase Orders
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    overview of the active orders
                  </p>
                </div>
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
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <TableHead>Cargo Dispatch Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="pr-4 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isPosLoading ? (
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
                            <TableCell className="pr-6 text-right">
                              <Checkbox
                                checked={selectedPoIds.includes(po.id)}
                                onCheckedChange={() => handleSelectPo(po.id)}
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

                {totalPages > 1 && (
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
                {form.formState.errors.po_detail_ids && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.po_detail_ids.message}
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
