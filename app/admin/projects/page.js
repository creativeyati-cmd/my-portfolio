import Link from "next/link";

import { getProjectTypes, listProjects } from "@/lib/db";

import {
  EmptyState,
  formatDateLabel,
  PageHeader,
  SectionHeader,
  StatusBadge,
  ToastBanner,
} from "../_components";
import ProjectActionsMenu from "../project-actions-menu";
import ProjectFilters from "../project-filters";

export const dynamic = "force-dynamic";

function applyFilters(projects, { q = "", status = "all", type = "all", sort = "updated-desc" }) {
  let next = [...projects];

  if (q) {
    const needle = q.toLowerCase();
    next = next.filter((project) =>
      [project.title, project.type, project.status, project.shortDescription]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  if (status !== "all") {
    next = next.filter((project) => project.status === status);
  }

  if (type !== "all") {
    next = next.filter((project) => project.type === type);
  }

  next.sort((left, right) => {
    if (sort === "title-asc") return left.title.localeCompare(right.title);
    if (sort === "views-desc") return right.viewCount - left.viewCount;
    if (sort === "updated-asc") {
      return new Date(left.updatedAt) - new Date(right.updatedAt);
    }
    return new Date(right.updatedAt) - new Date(left.updatedAt);
  });

  return next;
}

export default async function AdminProjectsPage({ searchParams }) {
  const params = await searchParams;
  const [projects, types] = await Promise.all([
    listProjects({ includeDrafts: true }),
    getProjectTypes(),
  ]);

  const filters = {
    q: params?.q || "",
    status: params?.status || "all",
    type: params?.type || "all",
    sort: params?.sort || "updated-desc",
  };
  const filtered = applyFilters(projects, filters);

  return (
    <div className="space-y-6">
      <ToastBanner toast={params?.toast} />

      <PageHeader
        title="Projects"
        description="Manage and publish your work."
        actions={
          <Link href="/admin/projects/new" className="admin-button admin-button-primary">
            + New project
          </Link>
        }
      />

      <ProjectFilters
        initialSearch={filters.q}
        initialStatus={filters.status}
        initialType={filters.type}
        initialSort={filters.sort}
        types={types}
      />

      {filtered.length ? (
        <section className="space-y-4">
          <SectionHeader title={`${filtered.length} project${filtered.length === 1 ? "" : "s"}`} />
          <div className="admin-panel overflow-visible bg-white">
            <div className="overflow-x-auto overflow-y-visible px-5 py-4">
              <table className="admin-table min-w-[860px]">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Published</th>
                    <th>Views</th>
                    <th>Updated</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <Link href={`/admin/projects/${project.id}/edit`} className="flex items-center gap-3">
                          <div className="h-12 w-16 overflow-hidden rounded-[10px] border border-black/8 bg-[#f1efe9]">
                            {project.posterPath ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={project.posterPath}
                                alt={project.title}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div>
                            <p className="font-['Satoshi'] text-sm font-medium text-[#202938]">
                              {project.title}
                            </p>
                            <p className="mt-1 text-xs text-black/46">{project.slug}</p>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="text-sm text-black/64">{project.type}</td>
                      <td className="text-sm text-black/64">
                        {project.publishedAt ? formatDateLabel(project.publishedAt) : "—"}
                      </td>
                      <td className="text-sm text-black/64">
                        {project.viewCount ? project.viewCount.toLocaleString() : "—"}
                      </td>
                      <td className="text-sm text-black/64">{formatDateLabel(project.updatedAt)}</td>
                      <td>
                        <div className="flex justify-end">
                          <ProjectActionsMenu
                            project={project}
                            redirectTo={`/admin/projects${params?.q || params?.status || params?.type || params?.sort ? `?${new URLSearchParams(Object.entries(filters).filter(([, v]) => v && v !== "all" && v !== "updated-desc")).toString()}` : ""}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          title={filters.q ? `No projects found for "${filters.q}".` : "No projects yet."}
          description={
            filters.q
              ? "Try a different search or clear the current filters."
              : "Create your first portfolio project."
          }
          action={
            filters.q ? (
              <Link href="/admin/projects" className="admin-button admin-button-secondary">
                Clear search
              </Link>
            ) : (
              <Link href="/admin/projects/new" className="admin-button admin-button-primary">
                + New project
              </Link>
            )
          }
        />
      )}
    </div>
  );
}
