export async function fetchPurchaseOrders() {
  const res = await fetch("/api/purchase-orders")
  if (!res.ok) throw new Error("Failed to fetch purchase orders")
  return res.json()
}
