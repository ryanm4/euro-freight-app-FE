export interface GDN {
  gdn_grn_ref: string;
  client_id: number;
  manufacture_id: number;
  forwarder_id: number;
  date: string;
  cartoons: string;
  actual_cartoons: string;
  gross_weight: string;
  actual_gross_weight: string;
  gross_volume: string;
  actual_gross_volume: string;
  status: string;
  created_by: string;
  vehicle_no: string;
  packing_list_ids: number[];
}
