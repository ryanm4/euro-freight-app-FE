import * as z from "zod"

export const goodsDispatchNoteSchema = z.object({
  client_id: z.number().min(1, "Client should be selected"),

  manufacture_id: z.number().min(1, "Manufacturer should be selected"),

  forwarder_id: z.number().min(1, "Forwarder should be selected"),

  date: z.string().min(1, "Date is required"),

  packing_list_ids: z
    .array(z.number())
    .min(1, "At least one Packing List is required"),

  cartoons: z.string().min(1, "Cartons is required"),

  actual_cartoons: z.string().min(1, "Actual Cartons is required"),

  gross_weight: z.string().min(1, "Gross Weight is required"),

  actual_gross_weight: z.string().min(1, "Actual Gross Weight is required"),

  gross_volume: z.string().min(1, "Gross Volume is required"),

  actual_gross_volume: z.string().min(1, "Actual Gross Volume is required"),

  status: z.string().min(1, "Status is required"),

  created_by: z.string().min(1, "Created By is required"),

  gdn_grn_ref: z.string().min(1, "GDN/GRN Reference is required"),

  vehicle_no: z.string().min(1, "Vehicle Number is required"),

  remarks: z.string().optional(),
})

export type GoodsDispatchNoteFormValues = z.infer<
  typeof goodsDispatchNoteSchema
>
