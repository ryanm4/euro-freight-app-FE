export interface PURCHASE_ORDER {
  id: number
  poNumber?: string | null
  totalQty?: number | null
  ex_factory_date?: string | null
  shipping_mode?: string | null
  final_destination?: string | null
  vendor: number
  freight_forwarder: number
  payment_mode?: string | null
  instructions?: string | null
  cargo_dispatch_date?: string | null
  filePath?: string | null
  status?: string | null
  packing_list_id?: number | null
  hbl_nos?: string | null
  dc_in_house_date?: string | null
  shipTo?: string | null
  created_by?: string | null
  created_on?: string | null
  updated_by?: string | null
  updated_on?: string | null
  // Item detail fields for packing list selection
  sku?: string | null
  item_description?: string | null
  size?: string | null
  unit_cost?: number | null
  carton_count?: number | null
  gross_weight?: number | null
  net_weight?: number | null
  carton_dimensions?: string | null
  cbm?: number | null
}
