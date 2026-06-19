export interface PURCHASE_ORDER {
  id: number
  po_number?: string | null
  po_quantity?: number | null
  ex_factory_date?: string | null
  shipping_mode?: string | null
  final_destination?: string | null
  supplier_id: number
  freight_forwarder: number
  payment_mode?: string | null
  instructions?: string | null
  cargo_dispatch_date?: string | null
  PO_url?: string | null
  status?: string | null
  packing_list_id?: number | null
  hbl_no?: string | null
  dc_inhouse_date?: string | null
  eta_dest?: string | null
  created_by?: string | null
  created_on?: string | null
  updated_by?: string | null
  updated_on?: string | null
}
