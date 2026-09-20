export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const res = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/users/${id}`)
    if (!res.ok) {
      return Response.json({ success: false, data: null }, { status: res.status })
    }
    const data = await res.json()
    return Response.json(data)
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch user by ID", data: null },
      { status: 500 }
    )
  }
}
