"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AdminIcon } from "./icons";

function updateQuery(pathname, params, router) {
  const query = params.toString();
  router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
}

export default function ProjectFilters({
  initialSearch = "",
  initialStatus = "all",
  initialType = "all",
  initialSort = "updated-desc",
  types = [],
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (search.trim()) {
        next.set("q", search.trim());
      } else {
        next.delete("q");
      }
      updateQuery(pathname, next, router);
    }, 250);

    return () => clearTimeout(timeout);
  }, [pathname, router, search, searchParams]);

  function handleSelect(key, value) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === "all" || value === "updated-desc") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    updateQuery(pathname, next, router);
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <label className="relative flex-1">
        <span className="sr-only">Search projects</span>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/45">
          <AdminIcon icon="search" size={16} />
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search projects..."
          className="admin-input pl-10"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3 md:w-auto">
        <select
          defaultValue={initialStatus}
          onChange={(event) => handleSelect("status", event.target.value)}
          className="admin-input min-w-[150px]"
          aria-label="Filter by status"
        >
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <select
          defaultValue={initialType}
          onChange={(event) => handleSelect("type", event.target.value)}
          className="admin-input min-w-[150px]"
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          defaultValue={initialSort}
          onChange={(event) => handleSelect("sort", event.target.value)}
          className="admin-input min-w-[160px]"
          aria-label="Sort projects"
        >
          <option value="updated-desc">Recently updated</option>
          <option value="updated-asc">Oldest updated</option>
          <option value="views-desc">Most viewed</option>
          <option value="title-asc">A-Z</option>
        </select>
      </div>
    </div>
  );
}
