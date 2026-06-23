export async function GET() {
  console.log("BACKEND_URL:", process.env.BACKEND_URL)

  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/purchase_orders`)

  const data = await res.json()
  return Response.json(data)
}
