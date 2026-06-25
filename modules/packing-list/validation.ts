import * as z from "zod"

export const packingListSchema = z.object({
  client_id: z
    .union([z.string(), z.number()])
    .refine((val) => String(val).length > 0, {
      message: "Client is required",
    }),

  date: z.string().min(1, "Date is required"),

  created_by: z.string().min(1, "Created By is required"),

  quantity: z
    .number()
    .min(1, "Item Quantity Required")
    .positive("Quantity must be greater than 0"),

  po_detail_ids: z
    .array(z.number())
    .min(1, "At least one PO Detail is required"),

  additional_info: z.string().optional(),
})

export type PackingListFormValues = z.infer<typeof packingListSchema>
