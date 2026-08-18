import Link from "next/link";

import { getProjectStats, listActivities, listProjects } from "@/lib/db";

import {
  EmptyState,
  formatRelativeTime,
  MetricCard,
  PageHeader,
  SectionHeader,
  StatusBadge,
} from "./_components";
import ProjectActionsMenu from "./project-actions-menu";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [stats, projects, activities] = await Promise.all([
    getProjectStats(),
    listProjects({ includeDrafts: true }),
    listActivities(6),
  ]);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Overview of your portfolio." />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Projects" value={stats.total} />
        <MetricCard label="Published" value={stats.published} accent />
        <MetricCard label="Drafts" value={stats.draft} />
        <MetricCard label="Archived" value={stats.archived} />
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Recent projects"
          action={
            <Link href="/admin/projects" className="text-sm text-[#202938] hover:underline">
              View all
            </Link>
          }
        />

        {recentProjects.length ? (
          <div className="admin-panel overflow-hidden bg-white">
            <div className="overflow-x-auto px-5 py-4">
              <table className="admin-table min-w-[760px]">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Updated</th>
                    <th>Views</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <Link
                          href={`/admin/projects/${project.id}/edit`}
                          className="flex items-center gap-3"
                        >
                          <div className="h-12 w-12 overflow-hidden rounded-[10px] border border-black/8 bg-[#f1efe9]">
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
                            <p className="mt-1 text-xs text-black/48">{project.slug}</p>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="text-sm text-black/64">{project.type}</td>
                      <td className="text-sm text-black/64">
                        {formatRelativeTime(project.updatedAt)}
                      </td>
                      <td className="text-sm text-black/64">
                        {project.viewCount ? project.viewCount.toLocaleString() : "—"}
                      </td>
                      <td>
                        <div className="flex justify-end">
                          <ProjectActionsMenu project={project} redirectTo="/admin" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No projects yet."
            description="Create your first portfolio project."
            action={
              <Link href="/admin/projects/new" className="admin-button admin-button-primary">
                + New project
              </Link>
            }
          />
        )}
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <SectionHeader title="Recent activity" />
          <div className="admin-panel bg-white px-5 py-2">
            {activities.length ? (
              activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`flex items-start justify-between gap-4 py-3 ${
                    index ? "border-t border-black/8" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-[#202938]">{activity.title}</p>
                    {activity.description ? (
                      <p className="mt-1 text-sm text-black/52">{activity.description}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-xs text-black/42">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-3 text-sm text-black/55">No recent activity yet.</div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Quick actions" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/admin/projects/new" className="admin-panel bg-white px-4 py-4 text-sm text-[#202938]">
              + New project
            </Link>
            <Link href="/admin/settings/content" className="admin-panel bg-white px-4 py-4 text-sm text-[#202938]">
              Edit homepage
            </Link>
            <Link href="/admin/settings/contact" className="admin-panel bg-white px-4 py-4 text-sm text-[#202938]">
              Edit contact information
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="admin-panel bg-white px-4 py-4 text-sm text-[#202938]"
            >
              View portfolio
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
