export interface PACKING_LIST_REF {
  id: number
  shipping_mode?: string | null
  packing_list_no?: string | null
}

export interface GOODS_DELIVER_NOTE {
  id: number
  gdn_no?: string | null
  client_name?: string | null
  manufacture_name?: string | null
  forwarder_name?: string | null
  date?: string | null
  cartoons?: string | null
  actual_cartoons?: string | null
  gross_weight?: string | null
  actual_gross_weight?: string | null
  gross_volume?: string | null
  actual_gross_volume?: string | null
  status?: string | null
  gdn_grn_ref?: string | null
  vehicle_no?: string | null
  driver_id?: number | null
  driver_name?: string | null
  wharf_staff_id?: number | null
  wharf_staff_name?: string | null
  dispatch_location?: string | null
  transport_mode?: string | null
  container_no?: string | null
  container_size?: string | null
  primary_seal_no?: string | null
  secondary_seal_no?: string | null
  custom_doc_status?: string | null
  created_by?: string | null
  created_on?: string | null
  updated_by?: string | null
  updated_on?: string | null
  packing_lists?: PACKING_LIST_REF[]
}
