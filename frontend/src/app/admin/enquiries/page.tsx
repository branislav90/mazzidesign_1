"use client";

import Link from "next/link";
import { useState } from "react";
import {
  categoryLabel,
  enquiryItemTypeLabel,
  ENQUIRY_STATUSES,
  EnquiryStatus,
  formatDate,
  useAdminEnquiries,
  usePatchEnquiryStatus,
} from "@/lib/api/admin";
import {
  Card,
  EmptyState,
  ErrorBox,
  inputClass,
  Loading,
  PageTitle,
} from "../_components/ui";

export default function AdminEnquiriesPage() {
  const [status, setStatus] = useState<EnquiryStatus | "">("");
  const enquiries = useAdminEnquiries(status);
  const patchStatus = usePatchEnquiryStatus();

  return (
    <div>
      <PageTitle title="Povpraševanja" />

      <div className="mb-4">
        <label htmlFor="enquiry-filter" className="sr-only">
          Filter po statusu
        </label>
        <select
          id="enquiry-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value as EnquiryStatus | "")}
          className={`${inputClass} w-auto`}
        >
          <option value="">Vsi statusi</option>
          {ENQUIRY_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {patchStatus.isError && (
        <div className="mb-4">
          <ErrorBox message="Spreminjanje statusa ni uspelo. Poskusite znova." />
        </div>
      )}

      {enquiries.isPending && <Loading />}
      {enquiries.isError && (
        <ErrorBox
          message={enquiries.error.message}
          onRetry={() => enquiries.refetch()}
        />
      )}

      {enquiries.isSuccess && (
        <Card>
          {enquiries.data.length === 0 ? (
            <EmptyState message="Ni povpraševanj za izbrani filter." />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-4 py-2 font-medium">Referenca</th>
                  <th className="px-4 py-2 font-medium">Prejeto</th>
                  <th className="px-4 py-2 font-medium">Izdelek</th>
                  <th className="px-4 py-2 font-medium">Ime</th>
                  <th className="px-4 py-2 font-medium">E-pošta</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.data.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/enquiries/${e.id}`}
                        className="font-medium text-neutral-900 underline"
                      >
                        {e.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-neutral-500">
                      {formatDate(e.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-neutral-700">
                      {categoryLabel(e.category)} → {enquiryItemTypeLabel(e.itemType)}
                    </td>
                    <td className="px-4 py-2 text-neutral-700">
                      {e.contactName}
                    </td>
                    <td className="px-4 py-2 text-neutral-700">
                      <a
                        href={`mailto:${e.contactEmail}`}
                        className="underline"
                      >
                        {e.contactEmail}
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      <label className="sr-only" htmlFor={`status-${e.id}`}>
                        Status povpraševanja {e.reference}
                      </label>
                      <select
                        id={`status-${e.id}`}
                        value={e.status}
                        onChange={(ev) =>
                          patchStatus.mutate({
                            id: e.id,
                            status: ev.target.value as EnquiryStatus,
                          })
                        }
                        className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm"
                      >
                        {ENQUIRY_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
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
