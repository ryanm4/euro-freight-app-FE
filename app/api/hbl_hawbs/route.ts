import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/bill_of_lading`)

  const data = await res.json()
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/bill_of_lading`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Failed to create Bill of Lading" },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("[HBL POST]", err)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
