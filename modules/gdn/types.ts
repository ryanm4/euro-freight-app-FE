export interface GOODS_DELIVER_NOTE {
  id?: number
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

export interface CREATE_GOODS_DISPATCH_NOTE {
  client_id: number
  manufacture_id: number
  forwarder_id: number

  date: string

  packing_list_ids: number[]

  cartoons: string
  actual_cartoons: string

  gross_weight: string
  actual_gross_weight: string

  gross_volume: string
  actual_gross_volume: string

  status: string
  created_by: string

  gdn_grn_ref: string
  vehicle_no: string
}
