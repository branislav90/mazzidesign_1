"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  categoryLabel,
  enquiryItemTypeLabel,
  ENQUIRY_STATUSES,
  EnquiryDetail,
  EnquiryStatus,
  formatDate,
  speciesLabel,
  useAdminEnquiry,
  usePatchEnquiry,
} from "@/lib/api/admin";
import {
  buttonPrimary,
  Card,
  ErrorBox,
  inputClass,
  Loading,
  PageTitle,
} from "../../_components/ui";

const TIMEFRAME_LABELS: Record<string, string> = {
  asap: "Čim prej",
  "1-3m": "1–3 mesece",
  "3-6m": "3–6 mesecev",
  exploring: "Še raziskuje",
};

const FINISH_LABELS: Record<string, string> = {
  oiled: "Oljeno",
  lacquered: "Lakirano",
  hardwax: "Trdi vosek",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-neutral-100 px-4 py-2 last:border-0">
      <dt className="w-44 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-neutral-800">{children}</dd>
    </div>
  );
}

function ConfigurationCard({ enquiry }: { enquiry: EnquiryDetail }) {
  const dims = Object.entries(enquiry.dimensionsMm ?? {});
  const derived = enquiry.derived ?? {};
  return (
    <Card>
      <h2 className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-900">
        Konfiguracija
      </h2>
      <dl>
        <Row label="Kategorija">{categoryLabel(enquiry.category)}</Row>
        <Row label="Izdelek">{enquiryItemTypeLabel(enquiry.itemType)}</Row>
        {enquiry.shape && <Row label="Oblika">{enquiry.shape}</Row>}
        <Row label="Dimenzije (mm)">
          {dims.length === 0 ? (
            "—"
          ) : (
            <ul>
              {dims.map(([key, value]) => (
                <li key={key}>
                  {key}: {value === null ? "ni prepričan/a" : `${value} mm`}
                </li>
              ))}
            </ul>
          )}
        </Row>
        <Row label="Izračunano">
          <ul>
            {derived.linearMeters !== undefined && (
              <li>Tekoči metri: {derived.linearMeters} m</li>
            )}
            {derived.frontAreaM2 !== undefined && (
              <li>Površina front: {derived.frontAreaM2} m²</li>
            )}
            {derived.boardVolumeM3 !== undefined && (
              <li>Volumen plošč: {derived.boardVolumeM3} m³</li>
            )}
            {derived.linearMeters === undefined &&
              derived.frontAreaM2 === undefined &&
              derived.boardVolumeM3 === undefined && <li>—</li>}
          </ul>
        </Row>
        <Row label="Les">
          {enquiry.material?.species
            ? speciesLabel(enquiry.material.species)
            : "ni prepričan/a"}
        </Row>
        <Row label="Površinska obdelava">
          {enquiry.material?.finish
            ? FINISH_LABELS[enquiry.material.finish] ?? enquiry.material.finish
            : "ni prepričan/a"}
        </Row>
        <Row label="Dodatki">
          {enquiry.extras.length === 0 ? "—" : enquiry.extras.join(", ")}
        </Row>
      </dl>
    </Card>
  );
}

export default function EnquiryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const enquiry = useAdminEnquiry(params.id);
  const patch = usePatchEnquiry(params.id);

  const [status, setStatus] = useState<EnquiryStatus | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const autoSeenSent = useRef(false);

  // Auto-mark New → Seen on first open.
  const data = enquiry.data;
  useEffect(() => {
    if (data && data.status === "New" && !autoSeenSent.current) {
      autoSeenSent.current = true;
      patch.mutate({ status: "Seen" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const effectiveStatus =
    status ?? (data?.status === "New" ? "Seen" : data?.status) ?? "New";
  const effectiveNotes = notes ?? data?.internalNotes ?? "";

  async function handleSave() {
    setSaveMessage(null);
    try {
      await patch.mutateAsync({
        status: effectiveStatus,
        internalNotes: effectiveNotes,
      });
      setSaveMessage("Shranjeno.");
    } catch (err) {
      setSaveMessage(
        err instanceof Error ? err.message : "Shranjevanje ni uspelo.",
      );
    }
  }

  return (
    <div>
      <PageTitle
        title={data ? `Povpraševanje ${data.reference}` : "Povpraševanje"}
        actions={
          <Link
            href="/admin/enquiries"
            className="text-sm text-neutral-500 underline hover:text-neutral-800"
          >
            ← Nazaj na seznam
          </Link>
        }
      />

      {enquiry.isPending && <Loading />}
      {enquiry.isError && (
        <ErrorBox
          message={enquiry.error.message}
          onRetry={() => enquiry.refetch()}
        />
      )}

      {data && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <ConfigurationCard enquiry={data} />

            {data.snapshot && (
              <Card className="p-4">
                <h2 className="mb-3 text-sm font-semibold text-neutral-900">
                  3D-posnetek konfiguracije
                </h2>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.snapshot.mediumUrl || data.snapshot.url}
                  alt="3D-posnetek konfiguracije"
                  className="max-h-96 rounded border border-neutral-200"
                />
              </Card>
            )}

            {data.photos.length > 0 && (
              <Card className="p-4">
                <h2 className="mb-3 text-sm font-semibold text-neutral-900">
                  Fotografije stranke
                </h2>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {data.photos.map((photo) => (
                    <li key={photo.id}>
                      <a href={photo.url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.thumbUrl}
                          alt={photo.alt || "Fotografija stranke"}
                          className="h-32 w-full rounded border border-neutral-200 object-cover"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-900">
                Stranka
              </h2>
              <dl>
                <Row label="Ime">{data.contact.name}</Row>
                <Row label="E-pošta">
                  <a href={`mailto:${data.contact.email}`} className="underline">
                    {data.contact.email}
                  </a>
                </Row>
                <Row label="Telefon">
                  <a href={`tel:${data.contact.phone}`} className="underline">
                    {data.contact.phone}
                  </a>
                </Row>
                <Row label="Kraj">{data.contact.town ?? "—"}</Row>
                <Row label="Časovni okvir">
                  {data.timeframe
                    ? TIMEFRAME_LABELS[data.timeframe] ?? data.timeframe
                    : "—"}
                </Row>
                <Row label="Prejeto">{formatDate(data.createdAt)}</Row>
                <Row label="Jezik">{data.locale === "en" ? "angleščina" : "slovenščina"}</Row>
              </dl>
            </Card>

            {data.notes && (
              <Card className="p-4">
                <h2 className="mb-2 text-sm font-semibold text-neutral-900">
                  Opombe stranke
                </h2>
                <p className="whitespace-pre-wrap text-sm text-neutral-700">
                  {data.notes}
                </p>
              </Card>
            )}

            <Card className="space-y-4 p-4">
              <h2 className="text-sm font-semibold text-neutral-900">
                Obdelava
              </h2>
              <div>
                <label
                  htmlFor="enquiry-status"
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500"
                >
                  Status
                </label>
                <select
                  id="enquiry-status"
                  value={effectiveStatus}
                  onChange={(e) =>
                    setStatus(e.target.value as EnquiryStatus)
                  }
                  className={inputClass}
                >
                  {ENQUIRY_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="enquiry-notes"
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500"
                >
                  Interne opombe
                </label>
                <textarea
                  id="enquiry-notes"
                  rows={5}
                  value={effectiveNotes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={patch.isPending}
                  className={buttonPrimary}
                >
                  {patch.isPending ? "Shranjevanje …" : "Shrani"}
                </button>
                {saveMessage && (
                  <span role="status" className="text-sm text-neutral-600">
                    {saveMessage}
                  </span>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
