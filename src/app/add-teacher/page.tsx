import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/session";

export default function AddTeacherPage() {
  return (
    <Suspense fallback={<main className="mx-auto min-h-screen max-w-3xl px-4 py-8"><div className="h-12 w-48 animate-pulse rounded-[10px] bg-subtle" /></main>}>
      <AddTeacherContent />
    </Suspense>
  );
}

async function AddTeacherContent() {
  await connection();
  const session = await getOwnerSession();
  if (!session) redirect("/login");

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <header className="border-b border-hairline pb-5"><Link href="/" className="text-sm font-semibold text-iris">Owner Console</Link><h1 className="mt-1 text-3xl font-semibold">Add teacher</h1></header>
      <form className="mt-6 grid gap-5 rounded-[12px] border border-hairline bg-white p-5 shadow-card sm:grid-cols-2" action="/api/owner/teachers" method="post">
        <label className="text-sm font-semibold" htmlFor="displayName">Teacher name<input id="displayName" name="displayName" required minLength={3} className="mt-2 h-12 w-full rounded-[10px] border border-hairline px-4 font-normal" /></label>
        <label className="text-sm font-semibold" htmlFor="contactPhone">Contact phone<input id="contactPhone" name="contactPhone" required placeholder="01XXXXXXXXX" className="mt-2 h-12 w-full rounded-[10px] border border-hairline px-4 font-normal" /></label>
        <label className="text-sm font-semibold" htmlFor="governorate">Governorate<input id="governorate" name="governorate" required className="mt-2 h-12 w-full rounded-[10px] border border-hairline px-4 font-normal" /></label>
        <label className="text-sm font-semibold" htmlFor="city">City<input id="city" name="city" required className="mt-2 h-12 w-full rounded-[10px] border border-hairline px-4 font-normal" /></label>
        <label className="text-sm font-semibold sm:col-span-2" htmlFor="subjects">Subjects (comma separated)<input id="subjects" name="subjects" required placeholder="Arabic, English" className="mt-2 h-12 w-full rounded-[10px] border border-hairline px-4 font-normal" /></label>
        <label className="text-sm font-semibold sm:col-span-2" htmlFor="stages">Stages (comma separated)<input id="stages" name="stages" required placeholder="Primary, Secondary" className="mt-2 h-12 w-full rounded-[10px] border border-hairline px-4 font-normal" /></label>
        <label className="text-sm font-semibold" htmlFor="planKey">Plan<select id="planKey" name="planKey" className="mt-2 h-12 w-full rounded-[10px] border border-hairline bg-white px-3 font-normal"><option value="basic">Basic</option><option value="silver">Silver</option><option value="gold">Gold</option></select></label>
        <label className="text-sm font-semibold" htmlFor="subscriptionMode">Subscription<select id="subscriptionMode" name="subscriptionMode" className="mt-2 h-12 w-full rounded-[10px] border border-hairline bg-white px-3 font-normal"><option value="trial">7-day trial</option><option value="paid">Paid period</option><option value="lifetime">Lifetime free</option></select></label>
        <label className="text-sm font-semibold" htmlFor="paidMonths">Paid months (if paid)<input id="paidMonths" name="paidMonths" type="number" min={1} max={36} defaultValue={1} className="mt-2 h-12 w-full rounded-[10px] border border-hairline px-4 font-normal" /></label>
        <label className="text-sm font-semibold" htmlFor="slug">Teacher slug<input id="slug" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" minLength={3} maxLength={40} className="mt-2 h-12 w-full rounded-[10px] border border-hairline px-4 font-normal" /></label>
        <label className="text-sm font-semibold" htmlFor="accessMode">Access mode<select id="accessMode" name="accessMode" className="mt-2 h-12 w-full rounded-[10px] border border-hairline bg-white px-3 font-normal"><option value="open">Open</option><option value="codeOnly">Code only</option></select></label>
        <label className="text-sm font-semibold" htmlFor="visibility">Visibility<select id="visibility" name="visibility" className="mt-2 h-12 w-full rounded-[10px] border border-hairline bg-white px-3 font-normal"><option value="listed">Listed</option><option value="unlisted">Unlisted</option></select></label>
        <div className="sm:col-span-2"><button type="submit" className="h-12 w-full rounded-[10px] bg-primary font-semibold text-white">Create teacher</button></div>
      </form>
    </main>
  );
}
