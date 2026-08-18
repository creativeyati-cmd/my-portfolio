import Link from "next/link";

import { getAdminSession } from "@/lib/auth";

import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }) {
  const session = await getAdminSession();
  if (session) {
    return (
      <main className="min-h-screen bg-[#f4f0ea] px-6 py-10 text-[#111] sm:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[32rem] items-center justify-center">
          <div className="w-full rounded-[36px] border border-black/8 bg-white/88 p-8 shadow-[0_35px_120px_rgba(17,17,17,0.08)] backdrop-blur sm:p-10">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black font-['Geist'] text-sm font-medium uppercase tracking-[0.22em] text-white">
                IO
              </span>
              <div>
                <p className="font-['Geist'] text-[11px] uppercase tracking-[0.28em] text-black/45">
                  Admin active
                </p>
                <p className="font-['Satoshi'] text-sm text-black/55">Session detected</p>
              </div>
            </div>

            <h1 className="mt-10 max-w-sm font-['PP_Neue_Montreal'] text-[2.9rem] leading-[0.94] tracking-[-0.055em] text-black sm:text-[3.5rem]">
              You are already inside.
            </h1>
            <p className="mt-5 max-w-md font-['Satoshi'] text-[15px] leading-7 text-black/62">
              Continue to the dashboard to update projects, settings, contact details, and portfolio content.
            </p>

            <div className="mt-10">
              <Link
                href="/admin"
                className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-black px-6 font-['Satoshi'] text-base font-medium text-white transition hover:bg-black/90"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const params = await searchParams;
  const hasError = params?.error === "invalid";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f0ea] px-6 py-10 text-[#111] sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(0,0,0,0.04),_transparent_35%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-white/45 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-[32rem] items-center justify-center">
        <section className="w-full rounded-[38px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.88))] p-8 shadow-[0_40px_140px_rgba(17,17,17,0.08)] backdrop-blur sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black font-['Geist'] text-sm font-medium uppercase tracking-[0.22em] text-white">
                IO
              </span>
              <div>
                <p className="font-['Geist'] text-[11px] uppercase tracking-[0.28em] text-black/45">
                  Portfolio admin
                </p>
                <p className="font-['Satoshi'] text-sm text-black/55">Secure access</p>
              </div>
            </div>
            <span className="rounded-full border border-black/10 px-3 py-1 font-['Geist'] text-[10px] uppercase tracking-[0.22em] text-black/42">
              Login
            </span>
          </div>

          <div className="mt-10">
            <p className="font-['Geist'] text-[11px] uppercase tracking-[0.26em] text-black/38">
              Admin sign in
            </p>
            <h1 className="mt-3 max-w-sm font-['PP_Neue_Montreal'] text-[3rem] leading-[0.93] tracking-[-0.06em] text-black sm:text-[3.9rem]">
              Enter the studio.
            </h1>
            <p className="mt-4 max-w-md font-['Satoshi'] text-[15px] leading-7 text-black/60">
              Sign in to manage projects, update portfolio copy, publish changes, and keep the site current.
            </p>
          </div>

          <form action={loginAction} className="mt-10 space-y-5">
            <label className="block">
              <span className="mb-3 block font-['Geist'] text-[11px] uppercase tracking-[0.22em] text-black/48">
                Email
              </span>
              <input
                type="email"
                name="identifier"
                autoComplete="email"
                className="min-h-16 w-full rounded-[1.75rem] border border-black/10 bg-[#fbfaf7] px-5 font-['Satoshi'] text-base text-black outline-none transition placeholder:text-black/26 focus:border-black/24 focus:bg-white"
                placeholder="creativeyati@gmail.com"
              />
            </label>
            <label className="block">
              <span className="mb-3 block font-['Geist'] text-[11px] uppercase tracking-[0.22em] text-black/48">
                Password
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                className="min-h-16 w-full rounded-[1.75rem] border border-black/10 bg-[#fbfaf7] px-5 font-['Satoshi'] text-base text-black outline-none transition placeholder:text-black/26 focus:border-black/24 focus:bg-white"
                placeholder="Enter your password"
              />
            </label>

            {hasError ? (
              <div className="rounded-[1.5rem] border border-[#b42318]/12 bg-[#fff5f3] px-4 py-3">
                <p className="font-['Satoshi'] text-sm text-[#b42318]">
                  The email or password did not match.
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              className="inline-flex min-h-16 w-full items-center justify-center rounded-full bg-black px-6 font-['Satoshi'] text-base font-medium text-white transition hover:bg-black/90"
            >
              Sign in
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
