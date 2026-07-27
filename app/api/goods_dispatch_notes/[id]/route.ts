export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/goods_dispatch_notes/${id}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch goods dispatch note" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error("GET goods_dispatch_notes/[id] error:", err)
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
      `${process.env.BACKEND_URL}/api/v1/goods_dispatch_notes/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    )

    if (!res.ok) {
      return Response.json(
        { error: "Failed to update goods dispatch note" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error("PUT goods_dispatch_notes/[id] error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}