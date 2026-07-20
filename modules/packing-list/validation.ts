import * as z from "zod"

export const packingListSchema = z.object({
  client_id: z.number().min(1, "Client should be selected"),

  manufacturer_id: z.number().min(1, "Manufacturer should be selected"),

  date: z.string().min(1, "Date is required"),

  document_date: z.string().min(1, "Document Date is required"),

  ship_to: z.string().min(1, "Ship To is required"),

  shipping_mode: z.string().min(1, "Shipping Mode is required"),

  total_volume: z.string().min(1, "Total Volume is required"),

  status: z.string().min(1, "Status is required"),

  created_by: z.string().min(1, "Created By is required"),

  additional_info: z.string().optional(),

  items: z
    .array(
      z.object({
        poNumber: z.string().min(1, "PO Number is required"),

        sku: z.string().optional(),

        itemDescription: z.string().optional(),

        size: z.string().optional(),

        unitCost: z.number().min(0, "Unit Cost cannot be negative"),

        quantity: z.number().min(0, "Quantity must be 0 or greater"),

        ctnCount: z.number().min(0, "Carton Count must be 0 or greater"),

        grossWeightKg: z.number().min(0, "Gross Weight must be 0 or greater"),

        netWeightKg: z.number().min(0, "Net Weight must be 0 or greater"),

        cartonDimensions: z.string().optional(),

        cbm: z.number().min(0, "CBM must be 0 or greater"),
      })
    )
    .optional(),
})

export type PackingListFormValues = z.infer<typeof packingListSchema>
