export interface PACKING_LIST {
  id?: number
  client_name?: string | null
  client_id?: string | null
  packing_list_id?: string | number
  date?: string | null
  gdn_id?: number | null
  grn_id?: number | null
  quantity?: number | null
  created_by?: string | null
  created_on?: string | null
  updated_by?: string | null
  updated_on?: string | null
}
export interface CREATE_PACKING_LIST {
  client_id: number
  date: string
  // gdn_id?: number
  created_by: string
  quantity: number
  po_detail_ids: number[]
}

export interface GET_ALL_PACKING_LIST {
  client_id: string
  created_by: string
  created_on: string
  date: string
  gdn_id: number | null
  grn_id: number | null
  packing_list_id: number
  purchase_orders: any[] // refine if you know PO structure
  quantity: number
  updated_by: string | null
  updated_on: string | null
}
