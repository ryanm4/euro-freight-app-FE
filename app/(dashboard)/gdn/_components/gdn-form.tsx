"use client"

import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { goodsDispatchNoteSchema } from "@/modules/gdn/validation"
import { useEffect, useMemo, useState } from "react"
import { FieldPath, useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CLIENT_LIST } from "@/modules/clients/types"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { IconCalendarFilled } from "@tabler/icons-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  GET_ALL_PACKING_LIST,
  PACKING_LIST,
} from "@/modules/packing-list/types"
import { gdnListApi } from "@/modules/gdn/api"
import { toast } from "sonner"
import { CREATE_GOODS_DISPATCH_NOTE } from "@/modules/gdn/types"
import { ClientApi } from "@/modules/clients/api"
import { getErrorMessage } from "@/lib/error-utils"
import { useQuery } from "@tanstack/react-query"
import { fetchClients } from "@/lib/api/clients"
import { packingListApi } from "@/modules/packing-list/api"

export default function GoodsDispatchNoteForm() {
  const router = useRouter()

  const [packingList, setPackingList] = useState<PACKING_LIST[]>([])

  const [isClientLoading, setIsLoading] = useState(false)

  type GDNListFormValues = z.infer<typeof goodsDispatchNoteSchema>
  const baseDefaultValues: GDNListFormValues = {
    client_id: 0,
    manufacture_id: 0,
    forwarder_id: 0,
    date: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    packing_list_ids: [],
    cartoons: "",
    actual_cartoons: "",
    gross_weight: "",
    actual_gross_weight: "",
    gross_volume: "",
    actual_gross_volume: "",
    status: "Pending",
    created_by: "admin",
    gdn_grn_ref: "",
    vehicle_no: "",
    remarks: "",
  }

  const form = useForm<GDNListFormValues>({
    resolver: zodResolver(goodsDispatchNoteSchema),
    defaultValues: baseDefaultValues,
  })

  const renderFormField = <TName extends FieldPath<GDNListFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<GDNListFormValues, TName>
    >["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />

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

  const onSubmit: SubmitHandler<GDNListFormValues> = async (values) => {
    try {
      setIsLoading(true)
      console.log(values)
      const payload: CREATE_GOODS_DISPATCH_NOTE = {
        client_id: Number(values.client_id),
        manufacture_id: Number(values.manufacture_id),
        forwarder_id: Number(values.forwarder_id),

        date: values.date,

        packing_list_ids: values.packing_list_ids,

        cartoons: values.cartoons,
        actual_cartoons: values.actual_cartoons,

        gross_weight: values.gross_weight,
        actual_gross_weight: values.actual_gross_weight,

        gross_volume: values.gross_volume,
        actual_gross_volume: values.actual_gross_volume,

        status: values.status,
        created_by: "User",

        gdn_grn_ref: values.gdn_grn_ref,
        vehicle_no: values.vehicle_no,
      }

      const response = await gdnListApi.create(payload)

      if (response.status === 200 || response.status === 201) {
        toast.success("Goods Dispatch Note created successfully")
        router.push("/gdn")
      }
    } catch (error) {
      console.error("Failed to create Goods Dispatch Note:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to create Packing List"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const client = useMemo(() => {
    return data?.data?.filter((c: CLIENT_LIST) => c.type === "client") || []
  }, [data])

  const manufacturer = useMemo(() => {
    return (
      data?.data?.filter((c: CLIENT_LIST) => c.type === "manufacturer") || []
    )
  }, [data])

  const forwarder = useMemo(() => {
    return data?.data?.filter((c: CLIENT_LIST) => c.type === "forwarder") || []
  }, [data])

  const comboboxItems = client.map((s: CLIENT_LIST) => ({
    value: String(s.id),
    label: s.name,
  }))

  const manufacturerOptions = manufacturer.map((m: CLIENT_LIST) => ({
    value: String(m.id),
    label: m.name,
  }))

  const forwarderOptions = forwarder.map((f: CLIENT_LIST) => ({
    value: String(f.id),
    label: f.name,
  }))

  const packingListOptions = useMemo(() => {
    return packingList.map((p) => ({
      value: String(p.packing_list_id),
      label: `${p.client_id} — PL #${p.packing_list_id} (Qty: ${p.quantity})`,
    }))
  }, [packingList])

  useEffect(() => {
    fetchData()
  }, [])
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await packingListApi.getAll()
      if (response.status === 200) {
        setPackingList(response.data)
        console.log("packingList response.data:", response.data)
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error)
      toast(getErrorMessage(error, "Failed to fetch jobs"))
    } finally {
      setIsLoading(false)
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
              {isLoading ? "Creating..." : "Create GDN"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            {/* Card 1 - Shipment Details */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md mb-2 font-medium">Shipment Details</h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Core shipment and transport information.
                </p>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("gdn_grn_ref", ({ field }) => (
                  <FormItem>
                    <FormLabel>GDN / GRN Reference</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter GDN / GRN Reference"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("vehicle_no", ({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle No</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Vehicle Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
              </CardContent>
            </Card>

            {/* Card 2 - Business Partners */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md mb-2 font-medium">Business Partners</h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Organizations involved in the shipment.
                </p>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {renderFormField("client_id", ({ field }: { field: any }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Client</FormLabel>
                    <Combobox
                      items={comboboxItems}
                      value={field.value ? String(field.value) : null}
                      onValueChange={(val: string | null) =>
                        field.onChange(val ? Number(val) : 0)
                      }
                    >
                      <ComboboxInput placeholder="Select client..." />
                      <ComboboxContent>
                        <ComboboxList>
                          <ComboboxCollection>
                            {(item: { value: string; label: string }) => (
                              <ComboboxItem key={item.value} value={item.value}>
                                {item.label}
                              </ComboboxItem>
                            )}
                          </ComboboxCollection>
                          <ComboboxEmpty>No clients found.</ComboboxEmpty>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField(
                  "manufacture_id",
                  ({ field }: { field: any }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Manufacturer</FormLabel>
                      <Combobox
                        items={manufacturerOptions}
                        value={field.value ? String(field.value) : null}
                        onValueChange={(val: string | null) =>
                          field.onChange(val ? Number(val) : 0)
                        }
                      >
                        <ComboboxInput placeholder="Select manufacturer..." />
                        <ComboboxContent>
                          <ComboboxList>
                            <ComboboxCollection>
                              {(item: { value: string; label: string }) => (
                                <ComboboxItem
                                  key={item.value}
                                  value={item.value}
                                >
                                  {item.label}
                                </ComboboxItem>
                              )}
                            </ComboboxCollection>
                            <ComboboxEmpty>
                              No manufacturers found.
                            </ComboboxEmpty>
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      <FormMessage />
                    </FormItem>
                  )
                )}

                {renderFormField(
                  "forwarder_id",
                  ({ field }: { field: any }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Forwarder</FormLabel>
                      <Combobox
                        items={forwarderOptions}
                        value={field.value ? String(field.value) : null}
                        onValueChange={(val: string | null) =>
                          field.onChange(val ? Number(val) : 0)
                        }
                      >
                        <ComboboxInput placeholder="Select forwarder..." />
                        <ComboboxContent>
                          <ComboboxList>
                            <ComboboxCollection>
                              {(item: { value: string; label: string }) => (
                                <ComboboxItem
                                  key={item.value}
                                  value={item.value}
                                >
                                  {item.label}
                                </ComboboxItem>
                              )}
                            </ComboboxCollection>
                            <ComboboxEmpty>No forwarders found.</ComboboxEmpty>
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      <FormMessage />
                    </FormItem>
                  )
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            {/* Card 3 - Packing Information */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md mb-2 font-medium">
                  Packing Information
                </h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Packing lists and carton quantities.
                </p>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {renderFormField("packing_list_ids", ({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Packing List</FormLabel>
                    <Combobox
                      items={packingListOptions}
                      multiple
                      value={field.value?.map(String) ?? []}
                      onValueChange={(vals: string[]) =>
                        field.onChange(vals.map(Number))
                      }
                    >
                      <ComboboxChips>
                        {field.value?.map((id) => {
                          const opt = packingListOptions.find(
                            (o) => o.value === String(id)
                          )
                          return (
                            <ComboboxChip key={id}>
                              {opt?.label ?? id}
                            </ComboboxChip>
                          )
                        })}
                        <ComboboxChipsInput placeholder="Select packing lists..." />
                      </ComboboxChips>
                      <ComboboxContent>
                        <ComboboxList>
                          <ComboboxCollection>
                            {(item: { value: string; label: string }) => (
                              <ComboboxItem key={item.value} value={item.value}>
                                {item.label}
                              </ComboboxItem>
                            )}
                          </ComboboxCollection>
                          <ComboboxEmpty>No packing lists found.</ComboboxEmpty>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <FormMessage />
                  </FormItem>
                ))}
                {renderFormField("cartoons", ({ field }) => (
                  <FormItem>
                    <FormLabel>Cartons</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Cartons" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("actual_cartoons", ({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Cartons</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Actual Cartons" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
              </CardContent>
            </Card>

            {/* Card 4 - Shipment Measurements */}
            <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md mb-2 font-medium">
                  Shipment Measurements
                </h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Planned versus actual shipment measurements.
                </p>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {renderFormField("gross_weight", ({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Weight</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Gross Weight" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("actual_gross_weight", ({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Gross Weight</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Actual Gross Weight"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("gross_volume", ({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Volume</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Gross Volume" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("actual_gross_volume", ({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Gross Volume</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Actual Gross Volume"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Card 5 - Additional Information */}
          <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-col gap-[0.5px]">
              <h3 className="text-md mb-2 font-medium">
                Additional Information
              </h3>
              <p className="mb-4 text-xs text-muted-foreground">
                Additional shipment remarks.
              </p>
            </CardHeader>

            <CardContent>
              {renderFormField("remarks", ({ field }) => (
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
        </form>
      </Form>
    </div>
  )
}
