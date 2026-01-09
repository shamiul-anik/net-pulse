import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // We don't need to do anything with the data, just acknowledge receipt
  // The request body will be the uploaded binary data
  await request.arrayBuffer();

  return NextResponse.json({ success: true, timestamp: Date.now() });
}

export async function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
