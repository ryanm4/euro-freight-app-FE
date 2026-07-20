export async function POST(request: Request) {
  const formData = await request.formData()

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/v1/packing_lists/upload`,
    {
      method: "POST",
      body: formData,
    }
  )

  const data = await res.json()

  return Response.json(data, { status: res.status })
}
