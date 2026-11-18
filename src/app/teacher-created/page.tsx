import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/session";

export default function TeacherCreatedPage({ searchParams }: { searchParams: Promise<{ slug?: string; username?: string; password?: string }> }) {
  return (
    <Suspense fallback={<main className="mx-auto min-h-screen max-w-lg px-4 py-8"><div className="h-12 w-48 animate-pulse rounded-[10px] bg-subtle" /></main>}>
      <TeacherCreatedContent searchParams={searchParams} />
    </Suspense>
  );
}

async function TeacherCreatedContent({ searchParams }: { searchParams: Promise<{ slug?: string; username?: string; password?: string }> }) {
  await connection();
  const session = await getOwnerSession();
  if (!session) redirect("/login");
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-8">
      <section className="w-full rounded-[12px] border border-hairline bg-white p-6 shadow-card">
        <p className="text-sm font-semibold text-success">Teacher created</p>
        <h1 className="mt-2 text-3xl font-semibold">One-time credentials</h1>
        <dl className="mt-6 grid gap-4 rounded-[10px] bg-subtle p-5"><div><dt className="text-sm text-muted">Student portal</dt><dd className="mt-1 break-all font-semibold">https://zash-academy.vercel.app/{params.slug}</dd></div><div><dt className="text-sm text-muted">Teacher admin</dt><dd className="mt-1 break-all font-semibold">https://zash-academy.vercel.app/{params.slug}/admin</dd></div><div><dt className="text-sm text-muted">Username</dt><dd className="mt-1 font-semibold">{params.username}</dd></div><div><dt className="text-sm text-muted">Temporary password</dt><dd className="mt-1 select-all font-semibold">{params.password}</dd></div></dl>
        <p className="mt-4 text-sm text-danger">Copy this password now. It is not shown again.</p>
        <Link href="/" className="mt-6 flex h-12 items-center justify-center rounded-[10px] bg-primary font-semibold text-white">Back to dashboard</Link>
      </section>
    </main>
  );
}
