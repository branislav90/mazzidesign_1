"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AdminProject,
  categoryLabel,
  PROJECT_CATEGORIES,
  ProjectCategory,
  ProjectStatus,
  useAdminProjects,
} from "@/lib/api/admin";
import {
  buttonPrimary,
  Card,
  EmptyState,
  ErrorBox,
  inputClass,
  Loading,
  PageTitle,
  StatusBadge,
} from "../_components/ui";

function projectThumb(p: AdminProject) {
  const cover =
    p.images.find((i) => i.mediaAssetId === p.coverImageId) ?? p.images[0];
  if (!cover) {
    return (
      <div
        aria-hidden
        className="h-10 w-14 rounded bg-neutral-200"
        title="Brez slike"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cover.thumbUrl}
      alt=""
      className="h-10 w-14 rounded object-cover"
    />
  );
}

export default function AdminProjectsPage() {
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [category, setCategory] = useState<ProjectCategory | "">("");
  const projects = useAdminProjects({ status, category });

  return (
    <div>
      <PageTitle
        title="Projekti"
        actions={
          <Link href="/admin/projects/new" className={buttonPrimary}>
            Nov projekt
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div>
          <label htmlFor="filter-status" className="sr-only">
            Filter po statusu
          </label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus | "")}
            className={`${inputClass} w-auto`}
          >
            <option value="">Vsi statusi</option>
            <option value="Draft">Osnutek</option>
            <option value="Published">Objavljeno</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-category" className="sr-only">
            Filter po kategoriji
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as ProjectCategory | "")
            }
            className={`${inputClass} w-auto`}
          >
            <option value="">Vse kategorije</option>
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {projects.isPending && <Loading />}
      {projects.isError && (
        <ErrorBox
          message={projects.error.message}
          onRetry={() => projects.refetch()}
        />
      )}

      {projects.isSuccess && (
        <Card>
          {projects.data.length === 0 ? (
            <EmptyState message="Ni projektov za izbrane filtre." />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-4 py-2 font-medium">Slika</th>
                  <th className="px-4 py-2 font-medium">Naslov</th>
                  <th className="px-4 py-2 font-medium">Kategorija</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">
                    <span aria-hidden>★</span>
                    <span className="sr-only">Izpostavljeno</span>
                  </th>
                  <th className="px-4 py-2 font-medium">Leto</th>
                  <th className="px-4 py-2 font-medium">Vrstni red</th>
                </tr>
              </thead>
              <tbody>
                {projects.data.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-2">{projectThumb(p)}</td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="font-medium text-neutral-900 underline"
                      >
                        {p.titleSl || p.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-neutral-700">
                      {categoryLabel(p.category)}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-2 text-amber-500">
                      {p.isFeatured ? (
                        <>
                          <span aria-hidden>★</span>
                          <span className="sr-only">Izpostavljeno</span>
                        </>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-neutral-700">{p.year}</td>
                    <td className="px-4 py-2 text-neutral-500">
                      {p.sortOrder}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}
