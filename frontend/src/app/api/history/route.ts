import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const existing = req.cookies.get('cybership_session')?.value;

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

  const apiRes = await fetch(`${backendUrl}/rates/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(existing && { Cookie: `cybership_session=${existing}` }),
    },
  });

  const data = await apiRes.json();
  const response = NextResponse.json(data, { status: apiRes.status });

  const setCookie = apiRes.headers.get('set-cookie');
  if (setCookie) {
     response.headers.set('set-cookie', setCookie);
  }

  return response;
}
