import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.BACKEND_URL}/api/v1/auth/login`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        username: email,
        name: email
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json(
        {
          message:
            errorData.message || `Authentication failed: ${response.status}`,
          error: "Unable to sign in. Please check your credentials.",
        },
        { status: response.status }
      );
    }
    const data = await response.json();

    const token = data.accessToken || data.token || data.data?.token;

    const res = NextResponse.json({
      success: true,
      accessToken: token,
      user: data.user || data.data?.user,
      message: data.message || "Login successful",
    });

    res.cookies.set({
      name: "auth_data",
      value: token || "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 86400,
    });
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.headers.set('set-cookie', setCookieHeader);
    }

    return res;
  } catch (error) {
    console.error("❌ Login API Error:", error);

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
