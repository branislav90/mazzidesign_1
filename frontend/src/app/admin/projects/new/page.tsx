"use client";

import Link from "next/link";
import { PageTitle } from "../../_components/ui";
import ProjectEditor from "../_components/ProjectEditor";

export default function NewProjectPage() {
  return (
    <div>
      <PageTitle
        title="Nov projekt"
        actions={
          <Link
            href="/admin/projects"
            className="text-sm text-neutral-500 underline hover:text-neutral-800"
          >
            ← Nazaj na seznam
          </Link>
        }
      />
      <ProjectEditor />
    </div>
  );
}
