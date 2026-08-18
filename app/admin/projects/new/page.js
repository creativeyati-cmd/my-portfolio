import { getProjectTypes, listCategories } from "@/lib/db";

import { PageHeader, ProjectEditorForm, ToastBanner } from "../../_components";
import ProjectPublishSuccessModal from "../../project-publish-success-modal";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({ searchParams }) {
  const params = await searchParams;
  const [categories, typeOptions] = await Promise.all([
    listCategories({ includeArchived: true }),
    getProjectTypes(),
  ]);

  return (
    <div className="space-y-6">
      {params?.toast === "project-published" ? null : <ToastBanner toast={params?.toast} />}
      <ProjectPublishSuccessModal toast={params?.toast} />
      <PageHeader title="New project" />
      <ProjectEditorForm
        mode="new"
        categories={categories}
        typeOptions={typeOptions}
        redirectTo="/admin/projects/new"
      />
    </div>
  );
}
