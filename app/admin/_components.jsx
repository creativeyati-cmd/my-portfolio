import Link from "next/link";

import {
  saveProjectAction,
  saveSiteSettingsAction,
  updateAccountAction,
} from "./actions";
import { AdminIcon } from "./icons";
import ProjectSubmitControls from "./project-submit-controls";
import ProjectEditorEnhancements from "./project-editor-enhancements";

function classes(...values) {
  return values.filter(Boolean).join(" ");
}

export function formatDateLabel(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatRelativeTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");

  return formatDateLabel(value);
}

export function getToastMessage(toast) {
  const map = {
    "settings-updated": "Settings updated.",
    "content-updated": "Content updated.",
    "contact-updated": "Contact details updated.",
    "project-created": "Project created.",
    "project-saved": "Changes saved.",
    "project-published": "Project published.",
    "project-drafted": "Project moved to drafts.",
    "project-archived": "Project archived.",
    "project-deleted": "Project deleted.",
    "project-duplicated": "Project duplicated.",
    "account-updated": "Account updated.",
  };

  return map[toast] || "";
}

export function ToastBanner({ toast, error }) {
  const message = error || getToastMessage(toast);
  if (!message) return null;

  return (
    <div
      className={classes(
        "admin-panel-soft flex items-center gap-3 px-4 py-3 text-sm",
        error ? "border-[#b42318]/20 bg-[#fff6f5] text-[#b42318]" : "",
      )}
    >
      <span className="admin-icon-badge">
        <AdminIcon icon={error ? "archive" : "check"} size={16} />
      </span>
      <span className={error ? "text-[#b42318]" : "text-[#202938]"}>{message}</span>
    </div>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <header className="admin-page-header">
      <div className="space-y-2">
        <h1 className="admin-page-title">{title}</h1>
        {description ? (
          <p className="text-sm leading-6 text-black/58">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

export function SectionHeader({ title, action, className = "" }) {
  return (
    <div className={classes("mb-4 flex items-center justify-between gap-4", className)}>
      <h2 className="admin-section-title">{title}</h2>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, trend, accent = false }) {
  return (
    <div
      className={classes(
        "admin-panel p-4",
        accent ? "border-[rgba(22,153,163,0.2)] bg-[rgba(22,153,163,0.04)]" : "bg-white",
      )}
    >
      <p className="admin-kicker">{label}</p>
      <p className="mt-3 font-['PP_Neue_Montreal'] text-[2rem] leading-none tracking-[-0.05em] text-[#202938]">
        {value}
      </p>
      {trend ? <p className="mt-2 text-sm text-black/50">{trend}</p> : null}
    </div>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className="admin-status" data-status={status}>
      {status}
    </span>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="admin-panel border-dashed bg-white px-5 py-7 text-center">
      <p className="font-['Satoshi'] text-base font-medium text-[#202938]">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/55">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Field({
  label,
  name,
  defaultValue = "",
  type = "text",
  placeholder,
  hint,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#202938]">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="admin-input"
      />
      {hint ? <span className="mt-2 block text-xs text-black/45">{hint}</span> : null}
    </label>
  );
}

export function SelectField({ label, name, defaultValue = "", options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#202938]">{label}</span>
      <select name={name} defaultValue={defaultValue} className="admin-input">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxField({ label, name, defaultChecked = false, hint }) {
  return (
    <label className="flex items-start gap-3 rounded-[10px] border border-black/8 bg-white px-3 py-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 size-4" />
      <span>
        <span className="block text-sm font-medium text-[#202938]">{label}</span>
        {hint ? <span className="mt-1 block text-xs leading-5 text-black/48">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Textarea({
  label,
  name,
  defaultValue = "",
  rows = 4,
  placeholder,
  hint,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#202938]">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className="admin-textarea leading-6"
      />
      {hint ? <span className="mt-2 block text-xs text-black/45">{hint}</span> : null}
    </label>
  );
}

export function SettingsForm({ redirectTo, savedState, children, submitLabel }) {
  return (
    <form action={saveSiteSettingsAction} className="space-y-6">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="savedState" value={savedState} />
      {children}
      <div className="flex justify-end">
        <button type="submit" className="admin-button admin-button-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function AccountForm({ account, redirectTo }) {
  return (
    <form action={updateAccountAction} className="space-y-6">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" name="displayName" defaultValue={account?.displayName || ""} />
        <Field label="Email" name="email" defaultValue={account?.email || ""} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Current password"
          name="currentPassword"
          type="password"
          placeholder="Required to change password"
        />
        <Field
          label="New password"
          name="newPassword"
          type="password"
          placeholder="Leave blank to keep current password"
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="admin-button admin-button-primary">
          Update profile
        </button>
      </div>
    </form>
  );
}

export function ProjectEditorForm({ project, categories = [], redirectTo, mode = "edit" }) {
  const formId = `project-editor-${project?.id || "new"}`;
  const isNew = mode === "new";
  const status = project?.status || "draft";

  return (
    <>
      <ProjectEditorEnhancements formId={formId} />
      <form
        id={formId}
        action={saveProjectAction}
        encType="multipart/form-data"
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
      >
        <input type="hidden" name="id" value={project?.id || ""} />
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="space-y-6">
          <section className="admin-panel bg-white p-5">
            <SectionHeader title="Main content" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Project title"
                name="title"
                defaultValue={project?.title || ""}
                placeholder="Nike Campaign"
              />
              <Field
                label="Slug"
                name="slug"
                defaultValue={project?.slug || ""}
                placeholder="nike-campaign"
              />
              <Textarea
                label="Short description"
                name="shortDescription"
                defaultValue={project?.shortDescription || ""}
                rows={3}
                hint="Used on project cards. Aim for 120–180 characters."
              />
              <Textarea
                label="Project description"
                name="longDescription"
                defaultValue={project?.longDescription || ""}
                rows={6}
              />
              <Field label="Role" name="role" defaultValue={project?.role || ""} />
              <Field label="Tools" name="tools" defaultValue={project?.tools || ""} />
              <Field label="Client" name="clientName" defaultValue={project?.clientName || ""} />
              <Textarea label="Credits" name="credits" defaultValue={project?.credits || ""} rows={3} />
            </div>
          </section>

          <section className="admin-panel bg-white p-5">
            <SectionHeader title="Media" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Cover image path or URL"
                name="posterPath"
                defaultValue={project?.posterPath || ""}
                placeholder="/uploads/images/... or https://..."
              />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#202938]">
                  Upload cover image
                </span>
                <input
                  type="file"
                  name="posterFile"
                  accept="image/*"
                  className="admin-input border-dashed"
                />
              </label>
              <Field
                label="Video URL"
                name="videoUrl"
                defaultValue={project?.videoUrl || ""}
                placeholder="YouTube, Vimeo, or direct video URL"
              />
              <Field
                label="Local video path"
                name="videoPath"
                defaultValue={project?.videoPath || ""}
                placeholder="/uploads/videos/..."
              />
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-[#202938]">
                  Upload video
                </span>
                <input
                  type="file"
                  name="videoFile"
                  accept="video/*"
                  className="admin-input border-dashed"
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="admin-panel bg-white p-5">
            <SectionHeader title="Project settings" />
            <div className="space-y-4">
              <SelectField
                label="Status"
                name="status"
                defaultValue={status}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                  { value: "archived", label: "Archived" },
                ]}
              />
              <SelectField
                label="Category"
                name="type"
                defaultValue={project?.type || categories[0] || ""}
                options={[
                  ...(project?.type && !categories.includes(project.type)
                    ? [{ value: project.type, label: project.type }]
                    : []),
                  ...categories.map((category) => ({ value: category, label: category })),
                ]}
              />
              <Field label="Year" name="year" defaultValue={project?.year || "2026"} />
              <Field
                label="Display order"
                name="sortOrder"
                type="number"
                defaultValue={project?.sortOrder ?? 0}
              />
              <Field
                label="Publish date"
                name="publishDate"
                type="date"
                defaultValue={project?.publishedAt ? String(project.publishedAt).slice(0, 10) : ""}
              />
              <CheckboxField
                label="Featured"
                name="featured"
                defaultChecked={project?.featured || false}
              />
            </div>
          </div>

          <div className="admin-panel bg-white p-5">
            <SectionHeader title="Actions" />
            <ProjectSubmitControls
              isNew={isNew}
              status={status}
              cancelHref="/admin/projects"
            />
          </div>
        </aside>
      </form>
    </>
  );
}
