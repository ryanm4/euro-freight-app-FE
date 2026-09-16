export interface SHIPMENT {
  hbl_ids: never[]
  final_seal_no: string
  container_size: string
  airline_shipping_line: string
  final_place_of_delivery: string
  mbl_mawb_no: string
  eta_destination: any
  eta_discharge_port: any
  eta_final_delivery_place: any
  etd_origin: any
  etd_colombo: any
  discharge_port: any
  container_number: any
  destination: any
  origin: any
  flight_number: any
  hbls: any
  origin_port: string
  voyage_number: string
  id: number
  vessel_name?: string | null
  status?: string | null
  created_by?: string | null
  created_on?: string | null
  updated_by?: string | null
  updated_on?: string | null
  hbl_hawb_details?: SHIPMENT_HBL[]
}

export interface SHIPMENT_HBL {
  id: number
  client_id: string
  manufacture_id: string
  date: string
  type: string
  shipment_id?: number | null
  planned_vessel_name?: string | null
  voyage_no?: string | null
  etd?: string | null
  eta?: string | null
  actual_etd?: string | null
  actual_eta?: string | null
  arrival_port?: string | null
  inland_location?: string | null
  mbl_mawb_no?: string | null
  status?: string | null
  no_pieces?: number | null
  gross_weight?: string | null
  chargeable_weight?: string | null
  cbm?: string | null
  container_seal_no?: string | null
  onboard_date?: string | null
  created_by?: string | null
  created_on?: string | null
  updated_by?: string | null
  updated_on?: string | null
}