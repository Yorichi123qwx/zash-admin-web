import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getOwnerSession } from "@/lib/session";
import { generateTeacherPassword, hashPassword } from "@/lib/password";

const schema = z.object({
  displayName: z.string().trim().min(3).max(100),
  contactPhone: z.string().trim().regex(/^\+[1-9]\d{7,14}$|^01[0125]\d{8}$/),
  governorate: z.string().trim().min(2).max(50),
  city: z.string().trim().min(1).max(100),
  subjects: z.string().trim().min(2).max(500),
  stages: z.string().trim().min(2).max(100),
  planKey: z.enum(["basic", "silver", "gold"]),
  subscriptionMode: z.enum(["trial", "paid", "lifetime"]),
  paidMonths: z.coerce.number().int().min(1).max(36).optional(),
  accessMode: z.enum(["open", "codeOnly"]),
  visibility: z.enum(["listed", "unlisted"]),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(40),
});

function normalizePhone(phone: string): string {
  return phone.startsWith("+") ? phone : `+20${phone.slice(1)}`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "Owner sign-in required" }, { status: 401 });

  const parsed = schema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) return NextResponse.json({ error: "Please check the form fields" }, { status: 400 });

  try {
    const db = getDb();
    if (await db.collection("teachers").findOne({ slug: parsed.data.slug })) {
      return NextResponse.json({ error: "This slug is already in use" }, { status: 409 });
    }

    const now = new Date();
    const password = generateTeacherPassword();
    const subscription: Record<string, unknown> = {
      status: parsed.data.subscriptionMode === "trial" ? "trial" : parsed.data.subscriptionMode === "lifetime" ? "lifetimeFree" : "active",
      startsAt: now,
      expiresAt: null,
      trialEndsAt: parsed.data.subscriptionMode === "trial" ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
      grantedBy: session.name,
    };
    if (parsed.data.subscriptionMode === "paid") {
      subscription.expiresAt = new Date(now.getTime() + (parsed.data.paidMonths ?? 1) * 30 * 24 * 60 * 60 * 1000);
    }

    const subjects = parsed.data.subjects.split(",").map((item) => item.trim()).filter(Boolean);
    const stages = parsed.data.stages.split(",").map((stage) => ({ stage: stage.trim(), grades: [] })).filter((item) => item.stage);
    const result = await db.collection("teachers").insertOne({
      slug: parsed.data.slug,
      displayName: parsed.data.displayName,
      photoMediaId: null,
      contactPhone: normalizePhone(parsed.data.contactPhone),
      whatsappPhone: null,
      bio: null,
      governorate: parsed.data.governorate,
      city: parsed.data.city,
      subjects,
      stages,
      expectedStudents: null,
      accessMode: parsed.data.accessMode,
      visibility: parsed.data.visibility,
      studentPortalWhenLocked: "readOnly",
      planKey: parsed.data.planKey,
      entitlementOverrides: {},
      subscription,
      status: "active",
      panelLocked: false,
      panelLockReason: null,
      adminUsername: parsed.data.slug,
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
      tokenVersion: 1,
      failedAttempts: 0,
      lockedUntil: null,
      counters: { students: 0, activeStudents: 0, lastActivityAt: null, firstActivityAt: null },
      createdAt: now,
      updatedAt: now,
      createdBy: { type: "owner", id: session.sub, name: session.name },
      version: 1,
    });

    await db.collection("auditLogs").insertOne({
      who: { type: "owner", id: session.sub, name: session.name },
      action: "teacher.create",
      target: { collection: "teachers", id: result.insertedId.toHexString(), name: parsed.data.displayName },
      before: null,
      after: { slug: parsed.data.slug, planKey: parsed.data.planKey },
      at: now,
      createdAt: now,
      updatedAt: now,
      version: 1,
    });

    const resultUrl = new URL("/teacher-created", request.url);
    resultUrl.searchParams.set("slug", parsed.data.slug);
    resultUrl.searchParams.set("username", parsed.data.slug);
    resultUrl.searchParams.set("password", password);
    return NextResponse.redirect(resultUrl, 303);
  } catch (error) {
    console.error("Teacher creation failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Unable to create teacher" }, { status: 503 });
  }
}
