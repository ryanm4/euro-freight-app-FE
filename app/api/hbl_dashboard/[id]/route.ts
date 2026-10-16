export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const requestData = await request.json()
  const res = await fetch(
    `${process.env.BACKEND_URL}/api/v1/bill_of_lading/hbl/po/totals/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    }
  )
  const data = await res.json()
  return Response.json(data)
}
