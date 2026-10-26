export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const type = searchParams.get("type")

  const backendUrl = new URL(`${process.env.BACKEND_URL}/api/v1/packing_lists`)
  if (status) {
    backendUrl.searchParams.set("status", status)
  }
  if (type) {
    backendUrl.searchParams.set("type", type)
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
