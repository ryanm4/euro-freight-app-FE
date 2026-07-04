import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/shipments`)

  const data = await res.json()
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/shipments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Failed to create shipment" },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("[SHIPMENT POST]", err)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
