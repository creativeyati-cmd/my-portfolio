"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  deleteProjectAction,
  duplicateProjectAction,
  setProjectStatusAction,
} from "./actions";
import { AdminIcon } from "./icons";

export default function ProjectActionsMenu({ project, redirectTo = "/admin/projects" }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [direction, setDirection] = useState("down");
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handlePointer(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setConfirmDelete(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function updateDirection() {
      const triggerRect = rootRef.current?.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight || 232;
      if (!triggerRect) return;

      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const shouldOpenUp = spaceBelow < menuHeight + 16 && spaceAbove > spaceBelow;
      setDirection(shouldOpenUp ? "up" : "down");
    }

    updateDirection();
    window.addEventListener("resize", updateDirection);
    window.addEventListener("scroll", updateDirection, true);

    return () => {
      window.removeEventListener("resize", updateDirection);
      window.removeEventListener("scroll", updateDirection, true);
    };
  }, [open]);

  const previewHref =
    project.status === "published"
      ? `/projects/${project.slug}`
      : `/admin/projects/${project.id}/preview`;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-black/8 text-[#202938] hover:bg-black/4"
        aria-expanded={open}
        aria-label={`Open actions for ${project.title}`}
      >
        <AdminIcon icon="more" size={18} />
      </button>

      {open ? (
        <div
          ref={menuRef}
          className={[
            "admin-dropdown absolute right-0 z-30 w-52 p-2",
            direction === "up" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]",
          ].join(" ")}
        >
          <div className="flex flex-col gap-1">
            <Link
              href={`/admin/projects/${project.id}/edit`}
              className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm text-[#202938] hover:bg-black/4"
            >
              <AdminIcon icon="content" size={16} />
              Edit
            </Link>
            <Link
              href={previewHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm text-[#202938] hover:bg-black/4"
            >
              <AdminIcon icon="preview" size={16} />
              Preview
            </Link>
            <form action={duplicateProjectAction}>
              <input type="hidden" name="id" value={project.id} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm text-[#202938] hover:bg-black/4"
              >
                <AdminIcon icon="copy" size={16} />
                Duplicate
              </button>
            </form>
            <form action={setProjectStatusAction}>
              <input type="hidden" name="id" value={project.id} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input
                type="hidden"
                name="status"
                value={project.status === "published" ? "draft" : "published"}
              />
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm text-[#202938] hover:bg-black/4"
              >
                <AdminIcon icon={project.status === "published" ? "archive" : "check"} size={16} />
                {project.status === "published" ? "Unpublish" : "Publish"}
              </button>
            </form>
            <form action={setProjectStatusAction}>
              <input type="hidden" name="id" value={project.id} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="status" value="archived" />
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm text-[#202938] hover:bg-black/4"
              >
                <AdminIcon icon="archive" size={16} />
                Archive
              </button>
            </form>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm text-[#b42318] hover:bg-[#b42318]/6"
            >
              <AdminIcon icon="delete" size={16} />
              Delete
            </button>
          </div>
        </div>
      ) : null}

      {confirmDelete ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/28 px-4">
          <div className="admin-dropdown w-full max-w-md p-5">
            <h2 className="admin-section-title">Delete &quot;{project.title}&quot;?</h2>
            <p className="mt-2 text-sm leading-6 text-black/60">
              This project will be permanently removed.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="admin-button admin-button-secondary"
              >
                Cancel
              </button>
              <form action={deleteProjectAction}>
                <input type="hidden" name="id" value={project.id} />
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <button type="submit" className="admin-button bg-[#b42318] text-white">
                  Delete project
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
