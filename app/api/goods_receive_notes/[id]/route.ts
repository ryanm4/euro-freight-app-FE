export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/goods_receive_notes/${id}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch goods receive note" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error("GET goods_receive_notes/[id] error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
