import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { getAdminAccount, getSiteSettings } from "@/lib/db";

import AdminNav from "./admin-nav";
import AdminUserMenu from "./admin-user-menu";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const session = await requireAdmin();
  const [account, settings] = await Promise.all([
    getAdminAccount(session.username),
    getSiteSettings(),
  ]);

  return (
    <main className="admin-workspace min-h-screen">
      <header className="sticky top-0 z-20 border-b border-black/8 bg-[rgba(245,245,242,0.92)] backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Link href="/admin" className="truncate text-sm font-medium text-[#202938]">
              Portfolio Admin
            </Link>
          </div>

          <div className="min-w-0 flex-1">
            <AdminNav />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={settings.portfolioUrl || "/"}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-[10px] px-3 py-2 text-sm text-[#202938] hover:bg-black/4 sm:inline-flex"
            >
              View portfolio
            </Link>
            <Link href="/admin/projects/new" className="admin-button admin-button-primary">
              + New project
            </Link>
            <AdminUserMenu
              username={session.username}
              displayName={account?.displayName}
              email={account?.email}
              portfolioUrl={settings.portfolioUrl || "/"}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
