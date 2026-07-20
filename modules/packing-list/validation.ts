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

        sku: z.string().min(1, "SKU is required"),

        itemDescription: z.string().min(1, "Item Description is required"),

        size: z.string().min(1, "Size is required"),

        unitCost: z.number().min(0, "Unit Cost cannot be negative"),

        quantity: z.number().positive("Quantity must be greater than 0"),

        ctnCount: z.number().positive("Carton Count must be greater than 0"),

        grossWeightKg: z
          .number()
          .positive("Gross Weight must be greater than 0"),

        netWeightKg: z.number().positive("Net Weight must be greater than 0"),

        cartonDimensions: z.string().min(1, "Carton Dimensions are required"),

        cbm: z.number().positive("CBM must be greater than 0"),
      })
    )
    .min(1, "At least one item is required"),
})

export type PackingListFormValues = z.infer<typeof packingListSchema>
