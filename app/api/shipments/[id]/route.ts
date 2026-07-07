export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/shipments/${id}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch shipment" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error("GET shipments/[id] error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
