import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export type OwnerSession = JWTPayload & { sub: string; role: "owner"; name: string };

function secret(): Uint8Array {
  if (!env.OWNER_SESSION_SECRET) throw new Error("OWNER_SESSION_SECRET is not configured");
  return new TextEncoder().encode(env.OWNER_SESSION_SECRET);
}

export async function createOwnerSession(ownerId: string, name: string): Promise<string> {
  return new SignJWT({ sub: ownerId, role: "owner", name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function getOwnerSession(): Promise<OwnerSession | null> {
  const token = (await cookies()).get("zash_owner_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.role !== "owner" || typeof payload.sub !== "string" || typeof payload.name !== "string") return null;
    return payload as OwnerSession;
  } catch {
    return null;
  }
}

export async function setOwnerCookie(token: string): Promise<void> {
  (await cookies()).set("zash_owner_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}

export async function clearOwnerCookie(): Promise<void> {
  (await cookies()).delete("zash_owner_session");
}
