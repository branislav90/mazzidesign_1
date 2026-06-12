"use client";

import { useState } from "react";
import {
  AdminApiError,
  formatKb,
  useAdminMedia,
  useDeleteMedia,
  useUploadMedia,
} from "@/lib/api/admin";
import {
  buttonSecondary,
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  PageTitle,
} from "../_components/ui";

export default function AdminMediaPage() {
  const media = useAdminMedia();
  const upload = useUploadMedia();
  const remove = useDeleteMedia();
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setActionError(null);
    try {
      await upload.mutateAsync(Array.from(files));
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Nalaganje ni uspelo.",
      );
    }
  }

  async function handleDelete(id: string, fileName: string) {
    if (!window.confirm(`Izbrišem datoteko »${fileName}«?`)) return;
    setActionError(null);
    try {
      await remove.mutateAsync(id);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 409) {
        setActionError("Datoteka je v uporabi in je ni mogoče izbrisati.");
      } else {
        setActionError(
          err instanceof Error ? err.message : "Brisanje ni uspelo.",
        );
      }
    }
  }

  return (
    <div>
      <PageTitle
        title="Medijska knjižnica"
        actions={
          <label className={buttonSecondary}>
            {upload.isPending ? "Nalaganje …" : "Naloži datoteke"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={upload.isPending}
              onChange={(e) => {
                void handleUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        }
      />

      {actionError && (
        <div className="mb-4">
          <ErrorBox message={actionError} />
        </div>
      )}

      {media.isPending && <Loading />}
      {media.isError && (
        <ErrorBox message={media.error.message} onRetry={() => media.refetch()} />
      )}

      {media.isSuccess &&
        (media.data.length === 0 ? (
          <Card>
            <EmptyState message="Knjižnica je prazna. Naložite prve datoteke." />
          </Card>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {media.data.map((m) => (
              <li key={m.id}>
                <Card className="p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.thumbUrl}
                    alt={m.altTextSl ?? m.fileName}
                    className="mb-2 h-28 w-full rounded object-cover"
                  />
                  <p
                    className="truncate text-xs font-medium text-neutral-800"
                    title={m.fileName}
                  >
                    {m.fileName}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                      {formatKb(m.sizeBytes)}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleDelete(m.id, m.fileName)}
                      disabled={remove.isPending}
                      className="text-xs text-red-700 underline disabled:opacity-50"
                    >
                      Izbriši
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
