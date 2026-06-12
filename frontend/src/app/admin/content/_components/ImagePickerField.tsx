"use client";

// Media picker for content sections: shows the selected image (resolved from
// the media library by id), opens a modal to pick an existing asset or upload
// a new one. Value is a MediaAsset id (GUID) or null — the public API resolves
// it to URLs; when null the site renders the procedural wood-grain placeholder.

import { useEffect, useRef, useState } from "react";
import {
  AdminMediaAsset,
  useAdminMedia,
  useUploadMedia,
} from "@/lib/api/admin";

export default function ImagePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const media = useAdminMedia();
  const selected = media.data?.find((m) => m.id === value);

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <div className="flex items-center gap-3">
        {value ? (
          selected ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.thumbUrl}
              alt={selected.fileName}
              className="h-16 w-24 rounded border border-neutral-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-24 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-xs text-neutral-400">
              {media.isPending ? "…" : "ni najdena"}
            </div>
          )
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50 text-center text-[11px] leading-tight text-neutral-400">
            lesni vzorec
            <br />
            (privzeto)
          </div>
        )}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            {value ? "Zamenjaj sliko" : "Izberi sliko"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-50"
            >
              Odstrani (uporabi vzorec)
            </button>
          )}
        </div>
      </div>

      {open && (
        <PickerModal
          onClose={() => setOpen(false)}
          onPick={(asset) => {
            onChange(asset.id);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function PickerModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (asset: AdminMediaAsset) => void;
}) {
  const media = useAdminMedia();
  const upload = useUploadMedia();
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const result = await upload.mutateAsync([files[0]]);
    const created = result.items[result.items.length - 1];
    if (created) onPick(created);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Izbira slike"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            Medijska knjižnica
          </h3>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => void handleUpload(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
              className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {upload.isPending ? "Nalaganje …" : "Naloži novo"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zapri"
              className="rounded border border-neutral-300 px-2.5 py-1.5 text-sm text-neutral-500 hover:bg-neutral-50"
            >
              ✕
            </button>
          </div>
        </div>

        {media.isPending && (
          <p className="py-8 text-center text-sm text-neutral-400">Nalaganje …</p>
        )}
        {media.isError && (
          <p className="py-8 text-center text-sm text-red-600">
            Napaka pri nalaganju medijev.
          </p>
        )}
        {media.isSuccess && media.data.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">
            Knjižnica je prazna — naložite prvo sliko.
          </p>
        )}
        {media.isSuccess && media.data.length > 0 && (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {media.data.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onPick(m)}
                  className="group block w-full overflow-hidden rounded border border-neutral-200 text-left hover:border-neutral-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.thumbUrl}
                    alt={m.fileName}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <span className="block truncate px-1.5 py-1 text-[11px] text-neutral-500 group-hover:text-neutral-800">
                    {m.fileName}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
