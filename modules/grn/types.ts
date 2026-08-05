export interface PackingList {
  id: number
  packing_list_no: string
  client_id: number
  manufacturer_id: number
  date: string
  gdn_id: number
  grn_id: number
  total_quantity: number
  ship_to: string
  shipping_mode: string
  status: string
  created_by: string
  created_on: string
  updated_by: string | null
  updated_on: string | null
}
export interface GOODS_RECEIVE_NOTE {
  id: number
  client_id?: string
  manufacture_id?: number | null
  forwarder_id?: number | null
  date?: string | null
  quantity?: number | null
  bill_id?: number | null
  status?: string | null
  created_by?: string | null
  created_on?: string | null
  updated_by?: string | null
  updated_on?: string | null
  packing_lists?: PackingList[] | null
}
