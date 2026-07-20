export interface PACKING_LIST_PURCHASE_ORDER {
  po_number: string
  po_id: number | null
  po_quantity: string
}

export interface PACKING_LIST {
  packing_list_id: number
  packing_list_no: string

  client_name?: string
  manufacturer_name?: string
  ship_to?: string

  gdn_id?: number | null
  grn_id?: number | null

  date?: string | null
  document_date?: string | null

  total_quantity?: number | null
  total_cartons?: number | null
  total_gross_weight_kg?: string | null
  total_net_weight_kg?: string | null
  total_cbm?: string | null
  total_volume?: string | null

  status?: string
  shipping_mode?: string

  created_by?: string | null
  created_on?: string | null
  updated_by?: string | null
  updated_on?: string | null

  purchase_orders?: PACKING_LIST_PURCHASE_ORDER[]
}
