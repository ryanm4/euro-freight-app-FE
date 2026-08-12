import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("req", req)

    const incomingFormData = await req.formData()
    const file = incomingFormData.get("purchase_order")

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file provided under 'purchase_order'" },
        { status: 400 }
      )
    }

    const outgoingFormData = new FormData()
    outgoingFormData.append("purchase_order", file)

    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/purchase_orders/upload`,
      {
        method: "POST",
        body: outgoingFormData,
      }
    )

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: "Upstream upload failed", detail: text },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("purchase-order upload error", err)
    return NextResponse.json(
      { error: "Failed to process purchase order upload" },
      { status: 500 }
    )
  }
}
