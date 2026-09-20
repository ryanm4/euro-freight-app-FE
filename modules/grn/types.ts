export interface PackingList {
  id: number
  packing_list_no: string
  client_id: number
  manufacturer_id: number
  date: string
  gdn_id: number
  grn_id: number
  total_quantity: number
  total_cartons: number
  ship_to: string
  shipping_mode: string
  status: string
  created_by: string
  created_on: string
  updated_by: string | null
  updated_on: string | null
}

export interface GDN {
  gdn_no: string
  id: number
  custom_doc_status: string
  status: string
  vehicle_no: string
  volume: number
  weight: string | number
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
  gdns?: GDN[] | null
  custom_document_status?: string | null
  vehicle_number?: string | null
  remarks?: string | null
}

export enum GRNStatus {
  DRAFT = "DRAFT",
  COMPLETED = "COMPLETED",
  SHIPPED = "SHIPPED",
  CANCELLED = "CANCELLED",
  SAVED = "SAVED",
}
