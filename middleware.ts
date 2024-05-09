import { NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(request: NextRequest) {
  if (userAgent(request).isBot || request.headers.get("user-agent")?.includes("Discordbot")) {
    const url = request.nextUrl;

    url.searchParams.set("is_bot", "true");

    return NextResponse.rewrite(url.toString());
  } else {
    return NextResponse.next();
  }
}
