export async function GET() {
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/bill_of_lading`)

  const data = await res.json()
  return Response.json(data)
}
