import { notFound } from "next/navigation";

import { getProjectById, getProjectTypes, listCategories } from "@/lib/db";

import { PageHeader, ProjectEditorForm, ToastBanner } from "../../../_components";
import ProjectPublishSuccessModal from "../../../project-publish-success-modal";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params, searchParams }) {
  const [{ id }, query, categories, typeOptions, project] = await Promise.all([
    params,
    searchParams,
    listCategories({ includeArchived: true }),
    getProjectTypes(),
    params.then(({ id }) => getProjectById(Number(id))),
  ]);

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
        typeOptions={typeOptions}
        redirectTo={`/admin/projects/${project.id}/edit`}
      />
    </div>
  );
}
