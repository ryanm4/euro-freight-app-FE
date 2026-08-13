import { NextRequest, NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  const backendUrl = new URL(`${process.env.BACKEND_URL}/api/v1/bill_of_lading`)
  if (status) {
    backendUrl.searchParams.set("status", status)
  }
  const res = await fetch(backendUrl.toString())

  if (!res.ok) {
    return Response.json(
      { error: "Failed to fetch HBL/HAWBs from backend" },
      { status: res.status }
    )
  }

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
