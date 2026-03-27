import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const existing = req.cookies.get('cybership_session')?.value;

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

  const apiRes = await fetch(`${backendUrl}/rates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(existing && { Cookie: `cybership_session=${existing}` }),
    },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json();
  const response = NextResponse.json(data, { status: apiRes.status });

  const setCookie = apiRes.headers.get('set-cookie');
  if (setCookie) {
     // Forward the Set-Cookie header to browser exactly
     response.headers.set('set-cookie', setCookie);
  }

  return response;
}
