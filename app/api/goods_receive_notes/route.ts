export async function GET() {
  const res = await fetch(
    `${process.env.BACKEND_URL}/api/v1/goods_receive_notes`
  )

  const data = await res.json()
  return Response.json(data)
}

export async function POST(request: Request) {
  console.log("BACKEND_URL:", process.env.BACKEND_URL)
  const body = await request.json()

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/v1/goods_receive_notes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )

  const data = await res.json()

  console.log("backend status:", res.status)
  console.log("backend response:", data)

  return Response.json(data, { status: res.status })
}
