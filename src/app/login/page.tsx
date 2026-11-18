export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form action="/api/owner/login" method="post" className="w-full rounded-[12px] border border-hairline bg-white p-6 shadow-card">
        <p className="text-sm font-semibold text-iris">Zash Academy</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Owner sign in</h1>
        <label className="mt-6 block text-sm font-semibold" htmlFor="owner-name">Owner</label>
        <select id="owner-name" name="name" required className="mt-2 h-12 w-full rounded-[10px] border border-hairline bg-white px-3">
          <option value="Mohamed El-Shamy">Mohamed El-Shamy</option>
          <option value="El-Qazzaz">El-Qazzaz</option>
        </select>
        <label className="mt-4 block text-sm font-semibold" htmlFor="owner-password">Password</label>
        <input id="owner-password" name="password" type="password" required minLength={12} className="mt-2 h-12 w-full rounded-[10px] border border-hairline px-4" />
        <button type="submit" className="mt-6 h-12 w-full rounded-[10px] bg-primary font-semibold text-white">Sign in</button>
      </form>
    </main>
  );
}
