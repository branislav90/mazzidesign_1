"use client";

import Link from "next/link";
import { useAdminProject } from "@/lib/api/admin";
import {
  EmptyState,
  ErrorBox,
  Loading,
  PageTitle,
} from "../../_components/ui";
import ProjectEditor from "../_components/ProjectEditor";

export default function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const project = useAdminProject(params.id);

  return (
    <div>
      <PageTitle
        title="Urejanje projekta"
        actions={
          <Link
            href="/admin/projects"
            className="text-sm text-neutral-500 underline hover:text-neutral-800"
          >
            ← Nazaj na seznam
          </Link>
        }
      />
      {project.isPending && <Loading />}
      {project.isError && (
        <ErrorBox
          message={project.error.message}
          onRetry={() => project.refetch()}
        />
      )}
      {project.isSuccess &&
        (project.data ? (
          <ProjectEditor key={project.data.id} project={project.data} />
        ) : (
          <EmptyState message="Projekt ne obstaja." />
        ))}
    </div>
  );
}
