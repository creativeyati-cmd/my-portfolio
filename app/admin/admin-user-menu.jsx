"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { logoutAction } from "./actions";
import { AdminIcon } from "./icons";

const LIVE_SITE_URL = "https://aivideocreator.cv/";

function initials(value) {
  return String(value || "Admin")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminUserMenu({ username, displayName, email, portfolioUrl }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handlePointer(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-medium text-[#202938]"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open user menu"
      >
        {initials(displayName || username)}
      </button>

      {open ? (
        <div className="admin-dropdown absolute right-0 top-[calc(100%+8px)] z-30 w-64 p-2">
          <div className="border-b border-black/8 px-3 py-3">
            <p className="font-['Satoshi'] text-sm font-medium text-[#202938]">
              {displayName || username}
            </p>
            <p className="mt-1 text-sm text-black/55">{email || username}</p>
          </div>

          <div className="py-2">
            <Link
              href={portfolioUrl || LIVE_SITE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm text-[#202938] hover:bg-black/4"
            >
              <AdminIcon icon="view" size={16} />
              View portfolio
            </Link>
            <Link
              href="/admin/settings/account"
              className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm text-[#202938] hover:bg-black/4"
            >
              <AdminIcon icon="settings" size={16} />
              Account settings
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm text-[#b42318] hover:bg-[#b42318]/6"
              >
                <AdminIcon icon="logout" size={16} />
                Log out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
