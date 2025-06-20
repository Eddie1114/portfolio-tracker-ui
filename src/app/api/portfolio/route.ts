import { NextResponse } from 'next/server';

const BACKEND_URL = 'https://portfolio-tracker-ox9i.onrender.com/api/portfolio';

// GET /api/portfolio - Proxy to backend
export async function GET() {
  try {
    const res = await fetch(BACKEND_URL);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch portfolio items from backend' },
      { status: 500 }
    );
  }
}

// POST /api/portfolio - Proxy to backend
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add portfolio item to backend' },
      { status: 500 }
    );
  }
} 