export interface HBL_PO_Dashboard_List {
  success: boolean
  message: string
  data: HBL[]
}

export interface Party {
  id: number
  name: string
  address: string | null
}

export interface HBL {
  id: number
  client: Party | null
  manufacture: Party | null
  shipper: Party | null
  consignee: Party | null
  notify: Party | null

  date: string | null
  type: "AIR" | "SEA"
  house_bl_no: string | null
  shipment_id: number | null
  planned_vessel_name: string | null
  voyage_no: string | null

  etd: string | null
  eta: string | null
  actual_etd: string | null
  actual_eta: string | null

  arrival_port: string | null
  inland_location: string | null
  mbl_mawb_no: string | null
  status: string

  no_pieces: number | null
  gross_weight: string | null
  chargeable_weight: string | null
  cbm: string | null
  container_seal_no: string | null
  onboard_date: string | null

  total_freight_cost: string | null
  total_volume: string | null
  total_cost: string | null

  created_by: string | null
  created_on: string | null
  updated_by: string | null
  updated_on: string | null

  shipments: Shipment[]
  ports: HBLPort[]
  po_details: PODetail[]
}

export interface Shipment {
  id: number
  grns: GRN[]

  origin: string | null
  status: string
  etd_origin: string | null
  destination: string | null
  etd_colombo: string | null
  mbl_mawb_no: string | null
  origin_port: string | null
  vessel_name: string | null
  final_seal_no: string | null
  flight_number: string | null
  voyage_number: string | null
  container_size: string | null
  discharge_port: string | null
  eta_destination: string | null
  container_number: string | null
  eta_discharge_port: string | null
  airline_shipping_line: string | null
  final_place_of_delivery: string | null
  eta_final_delivery_place: string | null
}

export interface GRN {
  id: number
  date: string | null
  gdns: GDN[]

  client: Party | null
  status: string
  bill_id: number | null
  comments: string | null
  quantity: number | null
  client_id: number | null
  manufacture: Party | null
  shipment_id: number | null
  forwarder_id: number | null
  recipient_id: number | null
  manufacture_id: number | null
  recipient_contact: string | null
  actual_carton_count: number | null
}

export interface GDN {
  id: number
  date: string | null
  gdn_no: string | null
  status: string
  cartoons: string | null

  width_cm: number | null
  height_cm: number | null
  length_cm: number | null

  client_id: number | null
  driver_id: number | null
  vehicle_no: string | null
  gdn_grn_ref: number | null
  container_no: string | null
  forwarder_id: number | null

  gross_volume: number | null
  gross_weight: string | null

  packing_lists: PackingList[]

  container_size: string | null
  manufacture_id: number | null
  transport_mode: string | null
  wharf_staff_id: number | null
  actual_cartoons: number | null
  primary_seal_no: string | null
  wharf_contact_no: string | null
  custom_doc_status: string | null
  dispatch_location: string | null
  driver_contact_no: string | null
  secondary_seal_no: string | null
  actual_gross_volume: number | null
  actual_gross_weight: string | null
}

export interface PackingList {
  id: number
  date: string | null
  gdn_id: number | null
  grn_id: number | null
  status: string
  ship_to: string | null
  file_url: string | null

  client_id: number | null
  total_cbm: number | null

  created_by: string | null
  created_on: string | null
  updated_by: string | null
  updated_on: string | null

  destination: string | null
  forwarder_id: number | null
  total_volume: number | null
  document_date: string | null

  shipping_mode: "AIR" | "FCL" | "LCL" | string

  total_cartons: number | null
  total_quantity: number | null
  manufacturer_id: number | null
  packing_list_no: string | null

  total_net_weight_kg: number | null
  total_gross_weight_kg: number | null
}

export interface PODetail {
  po_number: string
  carton_count: number
}

// The sample API returns an empty ports array,
// so its object structure cannot yet be determined.
export type HBLPort = Record<string, unknown>
