import Link from "next/link";

import { listActivities } from "@/lib/db";

import { EmptyState, PageHeader, SectionHeader } from "../_components";

export const dynamic = "force-dynamic";

const DATE_RANGES = [
  ["today", "Today"],
  ["7d", "Last 7 days"],
  ["30d", "Last 30 days"],
  ["3m", "Last 3 months"],
  ["12m", "Last 12 months"],
  ["custom", "Custom range"],
];

export default async function AdminAnalyticsPage({ searchParams }) {
  const params = await searchParams;
  const range = params?.range || "30d";
  const activities = listActivities(8);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        actions={
          <form method="get" className="flex items-center gap-2">
            <label className="sr-only" htmlFor="range">
              Date range
            </label>
            <select
              id="range"
              name="range"
              defaultValue={range}
              className="admin-input min-w-[180px]"
            >
              {DATE_RANGES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button type="submit" className="admin-button admin-button-secondary">
              Apply
            </button>
          </form>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["Visitors", "Project views", "Inquiries", "Conversion"].map((label) => (
          <div key={label} className="admin-panel bg-white p-4">
            <p className="admin-kicker">{label}</p>
            <p className="mt-3 font-['PP_Neue_Montreal'] text-[2rem] leading-none tracking-[-0.05em] text-[#202938]">
              —
            </p>
          </div>
        ))}
      </section>

      <EmptyState
        title="No analytics yet."
        description="Visitor data will appear here once your portfolio starts receiving tracked traffic."
      />

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
                {activity.href ? (
                  <Link href={activity.href} className="shrink-0 text-sm text-[#1699a3]">
                    Open
                  </Link>
                ) : null}
              </div>
            ))
          ) : (
            <div className="py-3 text-sm text-black/55">No activity yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
