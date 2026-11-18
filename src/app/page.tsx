import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getOwnerSession } from "@/lib/session";

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="mx-auto min-h-screen max-w-6xl px-4 py-8"><div className="h-12 w-48 animate-pulse rounded-[10px] bg-subtle" /></main>}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  await connection();
  const session = await getOwnerSession();
  if (!session) redirect("/login");

  const db = getDb();
  const [teachers, students, expired, locked] = await Promise.all([
    db.collection("teachers").find({ status: { $in: ["active", "hidden"] } }, { projection: { displayName: 1, slug: 1, subjects: 1, planKey: 1, subscription: 1, status: 1, panelLocked: 1 } }).sort({ displayName: 1 }).limit(100).toArray(),
    db.collection("students").countDocuments({ accountStatus: { $ne: "disabled" } }),
    db.collection("teachers").countDocuments({ "subscription.status": "expired" }),
    db.collection("teachers").countDocuments({ panelLocked: true }),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <header className="flex items-center justify-between border-b border-hairline pb-5"><div><p className="text-sm font-semibold text-iris">Owner Console</p><h1 className="mt-1 text-3xl font-semibold">Zash Academy</h1></div><div className="flex gap-2"><Link href="/add-teacher" className="flex h-11 items-center rounded-[10px] bg-primary px-4 font-semibold text-white">Add teacher</Link><form action="/api/owner/logout" method="post"><button type="submit" className="h-11 rounded-[10px] border border-hairline px-4 font-semibold">Sign out</button></form></div></header>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Teachers", teachers.length], ["Students", students], ["Expired", expired], ["Locked", locked]].map(([label, value]) => <article key={String(label)} className="rounded-[12px] border border-hairline bg-white p-5 shadow-card"><p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></article>)}
      </section>
      <section className="mt-6 overflow-hidden rounded-[12px] border border-hairline bg-white shadow-card"><div className="border-b border-hairline px-5 py-4"><h2 className="text-xl font-semibold">Teachers</h2></div>{teachers.length === 0 ? <p className="p-8 text-center text-muted">No teachers found.</p> : <div className="divide-y divide-hairline">{teachers.map((teacher) => <article key={teacher._id.toHexString()} className="grid gap-2 p-5 sm:grid-cols-[1fr_1fr_auto]"><div><p className="font-semibold">{String(teacher.displayName)}</p><p className="text-sm text-muted">/{String(teacher.slug)}</p></div><p className="text-sm">{Array.isArray(teacher.subjects) ? teacher.subjects.join(", ") : "-"}</p><p className="text-sm text-muted">{teacher.panelLocked ? "Locked" : String(teacher.status)}</p></article>)}</div>}</section>
    </main>
  );
}
