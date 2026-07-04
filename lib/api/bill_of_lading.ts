export async function fetchHBLHAWBs() {
  const res = await fetch("/api/hbl_hawbs")
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
  arrival_port: string
  inland_location: string
  mbl_mawb_no: string
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
  noOfPieces: string
  grossWeight: string
  chargeableWeight: string
  cmb: string
  containerSealNo: string
  onboardedDate: string
  selectedGrnIds: Set<number>
  ports: { id: number; value: string }[]
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
    arrival_port: input.arrivalPort,
    inland_location: input.inlandLocation,
    mbl_mawb_no: input.mblMawbNo,
    status: "Pending",
    no_pieces: Number(input.noOfPieces),
    gross_weight: input.grossWeight,
    chargeable_weight: input.chargeableWeight,
    cbm: input.cmb,
    container_seal_no: input.containerSealNo,
    onboard_date: formatDate(input.onboardedDate),
    created_by: "admin",
    grn_ids: Array.from(input.selectedGrnIds),
    ports: input.ports
      .filter((p) => p.value.trim() !== "")
      .map((p) => ({ port: p.value, status: "Pending" })),
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