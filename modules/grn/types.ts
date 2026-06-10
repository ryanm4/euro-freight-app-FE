export interface GRN {
  client_id: number;
  manufacture_id: number;
  forwarder_id: number;
  date: string;
  quantity: number;
  status: string;
  created_by: string;
  packing_list_ids: number[];
}
