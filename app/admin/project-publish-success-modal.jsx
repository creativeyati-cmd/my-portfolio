"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function withoutToast(params) {
  const next = new URLSearchParams(params.toString());
  next.delete("toast");
  const query = next.toString();
  return query ? `?${query}` : "";
}

export default function ProjectPublishSuccessModal({ toast, project }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (toast !== "project-published") {
    return null;
  }

  const close = () => {
    router.replace(`${pathname}${withoutToast(searchParams)}`, { scroll: false });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/28 px-4">
      <div className="admin-dropdown w-full max-w-md p-6">
        <div className="space-y-3">
          <p className="admin-kicker">Publishing complete</p>
          <h2 className="admin-page-title !text-[2rem]">
            {project?.title || "Project"} published successfully.
          </h2>
          <p className="text-sm leading-6 text-black/58">
            Your public portfolio has been updated.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={close} className="admin-button admin-button-secondary">
            Continue editing
          </button>
          {project?.slug ? (
            <Link
              href={`/projects/${project.slug}`}
              target="_blank"
              rel="noreferrer"
              className="admin-button admin-button-primary"
            >
              View project
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
