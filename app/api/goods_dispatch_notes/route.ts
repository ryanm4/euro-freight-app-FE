export async function GET(request: Request) {
  // const res = await fetch(
  //   `${process.env.BACKEND_URL}/api/v1/goods_dispatch_notes`
  // )

  // const data = await res.json()
  // return Response.json(data)
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  const backendUrl = new URL(
    `${process.env.BACKEND_URL}/api/v1/goods_dispatch_notes`
  )
  if (status) {
    backendUrl.searchParams.set("status", status)
  }

  const res = await fetch(backendUrl.toString())

  if (!res.ok) {
    return Response.json(
      { error: "Failed to fetch packing lists from backend" },
      { status: res.status }
    )
  }

  const data = await res.json()
  return Response.json(data)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/goods_dispatch_notes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return Response.json(
        { error: errorData?.message ?? "Failed to create goods dispatch note" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error("POST goods_dispatch_notes error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
