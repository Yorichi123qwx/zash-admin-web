import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createOwnerSession, setOwnerCookie } from "@/lib/session";

const schema = z.object({
  name: z.enum(["Mohamed El-Shamy", "El-Qazzaz"]),
  password: z.string().min(12).max(256),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = schema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) return NextResponse.json({ error: "Invalid login" }, { status: 401 });

  try {
    const db = getDb();
    const owner = await db.collection("owners").findOne({ name: parsed.data.name });
    if (!owner?.passwordHash || !(await verifyPassword(parsed.data.password, String(owner.passwordHash)))) {
      return NextResponse.json({ error: "Invalid login" }, { status: 401 });
    }
    if (owner.lockedUntil && new Date(owner.lockedUntil) > new Date()) {
      return NextResponse.json({ error: "Account temporarily locked" }, { status: 423 });
    }

    const now = new Date();
    await db.collection("owners").updateOne(
      { _id: owner._id, version: Number(owner.version ?? 1) },
      { $set: { failedAttempts: 0, lockedUntil: null, lastLoginAt: now, updatedAt: now }, $inc: { version: 1 } },
    );
    const token = await createOwnerSession(owner._id.toHexString(), owner.name);
    await setOwnerCookie(token);
    return NextResponse.redirect(new URL("/", request.url), 303);
  } catch (error) {
    console.error("Owner login failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Unable to sign in" }, { status: 503 });
  }
}
