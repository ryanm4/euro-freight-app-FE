export async function GET() {
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/packing_lists`)

  const data = await res.json()
  return Response.json(data)
}
