export async function fetchPurchaseOrders() {
  const res = await fetch("/api/purchase-orders")
  if (!res.ok) throw new Error("Failed to fetch purchase orders")
  return res.json()
}

export async function createPurchaseOrder(data: any) {
  debugger
  const res = await fetch("/api/purchase-orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || "Failed to create purchase order")
  }

  return res.json()
}

export async function fetchPurchaseOrderById(id: string) {
  const res = await fetch(`/api/purchase-orders/${id}`)
  if (!res.ok) throw new Error("Failed to fetch purchase order by ID")
  return res.json()
}

export async function parsePurchaseOrderExcel(file: File): Promise<any> {
  const formData = new FormData()
  formData.append("purchase_order", file)

  const res = await fetch("/api/purchase-orders/upload", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("Failed to parse purchase order file")
  }

  return res.json()
}