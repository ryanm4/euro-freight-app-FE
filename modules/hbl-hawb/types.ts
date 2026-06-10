export interface HBL_HAWB {
  client_id: number;
  manufacture_id: number;
  date: string;
  type: string;
  planned_vessel_name: string;
  voyage_no: string;
  etd: string;
  eta: string;
  arrival_port: string;
  inland_location: string;
  mbl_mawb_no: string;
  status: string;
  no_pieces: number;
  gross_weight: string;
  chargeable_weight: string;
  cbm: string;
  container_seal_no: string;
  onboard_date: string;
  created_by: string;
  grn_ids: number[];
}
