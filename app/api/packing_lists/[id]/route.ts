export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/packing_lists/${id}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch packing list" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error("GET packing_lists/[id] error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()

    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/packing_lists/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return Response.json(
        { error: errData.message || `Backend error: ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error("PUT packing_lists/[id] error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
