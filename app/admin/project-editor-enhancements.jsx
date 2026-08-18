"use client";

import { useEffect } from "react";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function ProjectEditorEnhancements({ formId }) {
  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return undefined;

    const titleInput = form.querySelector('input[name="title"]');
    const slugInput = form.querySelector('input[name="slug"]');
    let dirty = false;
    let slugTouched = Boolean(slugInput?.value);

    function markDirty() {
      dirty = true;
    }

    function syncSlug() {
      if (!titleInput || !slugInput || slugTouched) return;
      slugInput.value = slugify(titleInput.value);
    }

    function handleSlugInput() {
      slugTouched = Boolean(slugInput?.value);
      markDirty();
    }

    function handleSubmit() {
      dirty = false;
    }

    function handleBeforeUnload(event) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    const fields = form.querySelectorAll("input, textarea, select");
    fields.forEach((field) => field.addEventListener("input", markDirty));
    fields.forEach((field) => field.addEventListener("change", markDirty));
    titleInput?.addEventListener("input", syncSlug);
    slugInput?.addEventListener("input", handleSlugInput);
    form.addEventListener("submit", handleSubmit);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      fields.forEach((field) => field.removeEventListener("input", markDirty));
      fields.forEach((field) => field.removeEventListener("change", markDirty));
      titleInput?.removeEventListener("input", syncSlug);
      slugInput?.removeEventListener("input", handleSlugInput);
      form.removeEventListener("submit", handleSubmit);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formId]);

  return null;
}
