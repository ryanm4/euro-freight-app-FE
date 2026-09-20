export async function GET() {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/users`)
    if (!res.ok) {
      return Response.json({ success: false, data: [] }, { status: res.status })
    }
    const data = await res.json()
    return Response.json(data)
  } catch (error) {
    return Response.json({ success: false, message: "Failed to fetch users", data: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/auth/register/user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch (error) {
    return Response.json({ success: false, message: "Failed to create user" }, { status: 500 })
  }
}
