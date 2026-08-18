import { notFound } from "next/navigation";

import { getProjectById, getProjectTypes } from "@/lib/db";

import { PageHeader, ProjectEditorForm, ToastBanner } from "../../../_components";
import ProjectPublishSuccessModal from "../../../project-publish-success-modal";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params, searchParams }) {
  const [{ id }, query, categories] = await Promise.all([params, searchParams, getProjectTypes()]);
  const project = getProjectById(Number(id));

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {query?.toast === "project-published" ? null : <ToastBanner toast={query?.toast} />}
      <ProjectPublishSuccessModal toast={query?.toast} project={project} />
      <PageHeader title={project.title} description="Edit project" />
      <ProjectEditorForm
        project={project}
        categories={categories}
        redirectTo={`/admin/projects/${project.id}/edit`}
      />
    </div>
  );
}
