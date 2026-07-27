export interface CreateClientPayload {
  name: string
  address: string
  contact_no: string
  contact_person: string
  status: string
  type: string | number
  created_by?: string
}

export async function fetchClients() {
  const res = await fetch("/api/clients")
  if (!res.ok) throw new Error("Failed to fetch clients")
  return res.json()
}

export async function createClient(payload: CreateClientPayload) {
  const res = await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.message ?? "Failed to create client")
  }

  return res.json()
}

