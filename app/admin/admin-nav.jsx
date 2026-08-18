"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AdminIcon } from "./icons";
import { ADMIN_NAV_ITEMS } from "./nav";

function isActive(pathname, href) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({ item, active, mobile = false }) {
  return (
    <Link
      href={item.href}
      className={`inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm transition ${
        active
          ? "bg-[#202938] text-white"
          : "text-[#202938] hover:bg-black/5"
      } ${mobile ? "w-full justify-start" : ""}`}
    >
      <AdminIcon icon={item.icon} size={16} />
      <span className="font-['Satoshi']">{item.label}</span>
    </Link>
  );
}

export default function AdminNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-black/10 bg-white text-[#202938]"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          <AdminIcon icon="menu" size={18} />
        </button>

        {mobileOpen ? (
          <div className="admin-dropdown absolute left-4 right-4 top-[72px] z-30 p-2">
            <div className="flex flex-col gap-1">
              {ADMIN_NAV_ITEMS.map((item) => (
                <div key={item.href} onClick={() => setMobileOpen(false)}>
                  <NavItem item={item} active={isActive(pathname, item.href)} mobile />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
