import { NextResponse } from "next/server";
import { clearOwnerCookie } from "@/lib/session";

export async function POST(): Promise<NextResponse> {
  await clearOwnerCookie();
  return NextResponse.redirect(new URL("/login", process.env.PUBLIC_BASE_URL ?? "http://localhost:3001"), 303);
}
