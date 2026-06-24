export async function fetchPurchaseOrders() {
  const res = await fetch("/api/purchase-orders")
  if (!res.ok) throw new Error("Failed to fetch purchase orders")
  return res.json()
}

export async function createPurchaseOrder(data: any) {
  const payload = {
    po_number: data.poNumber,
    po_quantity: parseInt(data.poQuantity),
    ex_factory_date: data.exFactoryDate,
    final_destination: data.finalDestination,
    supplier_id: parseInt(data.supplier),
    freight_forwarder: parseInt(data.freightForwarder),
    payment_mode: data.paymentMode,
    instructions: data.instructions,
    PO_url: data.poDocumentUrl ?? "",
    status: "Pending",
    created_by: "admin",
    items: data.cargoItems.map((item: any) => ({
      sku: item.sku,
      item_name: item.itemName,
      color: item.color,
      size: item.size,
      country_of_origin: item.countryOfOrigin,
      unit_cost: parseFloat(item.unitCost),
      quantity: parseInt(item.quantity),
      cartoons: parseInt(item.cartons),
      gross_weight: item.grossWeight,
      net_weight: item.netWeight,
      ctn_demi: item.ctnDimensions,
      cbm: item.cbm,
      dispatched_quantity: parseInt(item.dispatchedQuantity) || 0,
      status: "Pending",
    })),
  }

  const res = await fetch("/api/purchase-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error("Failed to create purchase order")
  return res.json()
}
