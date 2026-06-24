export interface GOODS_DELIVER_NOTE {
  id: number
  client_name?: string
  manufacture_id?: number | null
  forwarder_id?: number | null
  date?: string | null
  cartoons?: string | null
  actual_cartoons?: string | null
  gross_weight?: string | null
  actual_gross_weight?: string | null
  gross_volume?: string | null
  actual_gross_volume?: string | null
  status?: string | null
  created_by?: string | null
  created_on?: string | null
  updated_by?: string | null
  updated_on?: string | null
  gdn_grn_ref?: string | null
  vehicle_no?: string | null
}
