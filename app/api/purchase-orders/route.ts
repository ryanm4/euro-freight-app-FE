export async function GET() {
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/purchase_orders`)

  const data = await res.json()
  return Response.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/purchase_orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
