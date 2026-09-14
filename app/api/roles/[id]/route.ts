export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/auth/roles/${id}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch role" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error("GET roles/[id] error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/auth/roles/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      return Response.json(
        { error: "Failed to update role" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (error) {
    console.error("PUT roles/[id] error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
