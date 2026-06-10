export interface PurchaseOrderItem {
  sku: string;
  item_name: string;
  color: string;
  size: string;
  country_of_origin: string;
  unit_cost: number;
  quantity: number;
  cartoons: number;
  gross_weight: string;
  net_weight: string;
  ctn_demi: string;
  cbm: string;
  dispatched_quantity: number;
  status: string;
}

export interface PURCHASE_ORDER {
  po_number: string;
  po_quantity: number;
  ex_factory_date: string;
  shipping_mode: string;
  final_destination: string;
  supplier_id: number;
  freight_forwarder: number;
  payment_mode: string;
  instructions: string;
  actual_delivery_date: string;
  PO_url: string;
  status: string;
  created_by: string;
  items: PurchaseOrderItem[];
  
  // Backwards compatibility for the old schema properties
  po_id?: number;
  customer_po?: string;
  customer?: { name: string };
  po_date?: string;
  delivery_date?: string;
  jobs?: any[];
}
