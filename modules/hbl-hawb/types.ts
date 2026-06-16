export interface HBL_HAWB {
  id: number
  client_id?: number | null
  manufacture_id?: number | null
  date?: string | null
  type?: string | null
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