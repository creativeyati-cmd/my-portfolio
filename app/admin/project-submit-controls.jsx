"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton({ intent, idleLabel, pendingLabel, variant }) {
  const { pending } = useFormStatus();
  const [lastIntent, setLastIntent] = useState(null);
  const active = pending && lastIntent === intent;

  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      onClick={() => setLastIntent(intent)}
      disabled={pending}
      className={variant}
    >
      {active ? pendingLabel : idleLabel}
    </button>
  );
}

export default function ProjectSubmitControls({ isNew, status, cancelHref }) {
  const publishIntent = isNew || status !== "published" ? "publish" : "save";
  const publishIdleLabel = isNew || status !== "published" ? "Publish" : "Update";
  const publishPendingLabel =
    isNew || status !== "published" ? "Publishing..." : "Saving...";

  return (
    <div className="flex flex-col gap-3">
      <Link href={cancelHref} className="admin-button admin-button-secondary">
        Cancel
      </Link>
      <SubmitButton
        intent="save-draft"
        idleLabel="Save draft"
        pendingLabel="Saving draft..."
        variant="admin-button admin-button-secondary"
      />
      <SubmitButton
        intent={publishIntent}
        idleLabel={publishIdleLabel}
        pendingLabel={publishPendingLabel}
        variant="admin-button admin-button-primary"
      />
      <ProjectPendingMessage />
    </div>
  );
}

function ProjectPendingMessage() {
  const { pending } = useFormStatus();

  if (!pending) return null;

  return (
    <p className="text-xs leading-5 text-black/48">
      Please wait while your project is being processed.
    </p>
  );
}
