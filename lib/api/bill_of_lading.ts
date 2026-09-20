export async function fetchHBLHAWBs(status?: string, mode?: string) {
  const params = new URLSearchParams()
  if (status) params.set("status", status)
  if (mode) params.set("mode", mode)

  const qs = params.toString()
  const url = qs ? `/api/hbl_hawbs?${qs}` : "/api/hbl_hawbs"
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch HBL/HAWBs")
  return res.json()
}

export interface BillOfLadingPort {
  port: string
  status: string
}

export interface CreateBillOfLadingPayload {
  client_id: number
  manufacture_id: number
  date: string
  type: string
  planned_vessel_name: string
  voyage_no: string
  etd: string
  eta: string
  actual_etd: string
  actual_eta: string
  arrival_port: string
  inland_location: string
  mbl_mawb_no: string
  house_bl_no: string
  status: string
  no_pieces: number
  gross_weight: string
  chargeable_weight: string
  cbm: string
  container_seal_no: string
  onboard_date: string
  created_by: string
  grn_ids: number[]
  ports: BillOfLadingPort[]
  shipper_id: number
  consignee_id: number
  notify_id: number
  total_freight_cost: string | number
}

export interface CreateBillOfLadingInput {
  client: string
  manufacturer: string
  date: string
  type: string
  vesselName: string
  voyageNo: string
  estimatedTimeOfDelivery: string
  estimatedTimeOfArrival: string
  arrivalPort: string
  inlandLocation: string
  mblMawbNo: string
  house_bl_no: string
  noOfPieces: string
  grossWeight: string
  chargeableWeight: string
  cbm: string
  containerSealNo: string
  onboardedDate: string
  actualTimeOfDelivery: string
  actualTimeOfArrival: string
  selectedGrnIds: Set<number>
  ports: { id: number; value: string }[]
  status: string
  shipperId: string
  consigneeId: string
  notifyId: string
  total_freight_cost: string
}

const formatDate = (val: string) =>
  val ? new Date(val).toISOString().slice(0, 19).replace("T", " ") : ""

function buildBillOfLadingPayload(
  input: CreateBillOfLadingInput
): CreateBillOfLadingPayload {
  return {
    client_id: Number(input.client),
    manufacture_id: Number(input.manufacturer),
    date: formatDate(input.date),
    type: input.type,
    planned_vessel_name: input.vesselName,
    voyage_no: input.voyageNo,
    etd: formatDate(input.estimatedTimeOfDelivery),
    eta: formatDate(input.estimatedTimeOfArrival),
    actual_etd: formatDate(input.actualTimeOfDelivery),
    actual_eta: formatDate(input.actualTimeOfArrival),
    arrival_port: input.arrivalPort,
    inland_location: input.inlandLocation,
    mbl_mawb_no: input.mblMawbNo,
    house_bl_no: input.house_bl_no,
    status: input.status,
    no_pieces: Number(input.noOfPieces),
    gross_weight: input.grossWeight,
    chargeable_weight: input.chargeableWeight,
    cbm: input.cbm,
    container_seal_no: input.containerSealNo,
    onboard_date: formatDate(input.onboardedDate),
    created_by: "admin",
    grn_ids: Array.from(input.selectedGrnIds),
    ports: input.ports
      .filter((p) => p.value.trim() !== "")
      .map((p) => ({ port: p.value, status: "Pending" })),
    shipper_id: Number(input.shipperId),
    consignee_id: Number(input.consigneeId),
    notify_id: Number(input.notifyId),
    total_freight_cost: Number(input.total_freight_cost) || 0,
  }
}

export async function createBillOfLading(input: CreateBillOfLadingInput) {
  const payload = buildBillOfLadingPayload(input)

  const res = await fetch("/api/hbl_hawbs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.message ?? "Failed to create Bill of Lading")
  }

  return res.json()
}

export async function fetchBillOfLadingById(id: string) {
  const res = await fetch(`/api/hbl_hawbs/${id}`)
  if (!res.ok) throw new Error("Failed to fetch bill of lading by ID")
  return res.json()
}

export async function updateBillOfLading(
  id: string,
  input: CreateBillOfLadingInput
) {
  const payload = buildBillOfLadingPayload(input)

  const res = await fetch(`/api/hbl_hawbs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.message ?? "Failed to update Bill of Lading")
  }

  return res.json()
}
