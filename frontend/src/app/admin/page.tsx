"use client";

// Dashboard: count of New enquiries + the 10 most recent enquiries.

import Link from "next/link";
import {
  categoryLabel,
  enquiryStatusLabel,
  formatDate,
  useAdminEnquiries,
} from "@/lib/api/admin";
import {
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  PageTitle,
} from "./_components/ui";

export default function AdminDashboardPage() {
  const enquiries = useAdminEnquiries();

  const newCount =
    enquiries.data?.filter((e) => e.status === "New").length ?? 0;
  const recent = enquiries.data?.slice(0, 10) ?? [];

  return (
    <div>
      <PageTitle title="Nadzorna plošča" />

      {enquiries.isPending && <Loading />}
      {enquiries.isError && (
        <ErrorBox
          message={enquiries.error.message}
          onRetry={() => enquiries.refetch()}
        />
      )}

      {enquiries.isSuccess && (
        <div className="space-y-6">
          <Card className="flex items-center gap-4 p-5">
            <p className="text-3xl font-semibold text-neutral-900">
              {newCount}
            </p>
            <div>
              <p className="text-sm font-medium text-neutral-900">
                novih povpraševanj
              </p>
              <Link
                href="/admin/enquiries"
                className="text-sm text-neutral-500 underline hover:text-neutral-800"
              >
                Vsa povpraševanja →
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-900">
              Zadnja povpraševanja
            </h2>
            {recent.length === 0 ? (
              <EmptyState message="Ni še nobenega povpraševanja." />
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                    <th className="px-4 py-2 font-medium">Referenca</th>
                    <th className="px-4 py-2 font-medium">Kategorija</th>
                    <th className="px-4 py-2 font-medium">Ime</th>
                    <th className="px-4 py-2 font-medium">Prejeto</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e) => (
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
                      <td className="px-4 py-2 text-neutral-700">
                        {categoryLabel(e.category)} / {e.itemType}
                      </td>
                      <td className="px-4 py-2 text-neutral-700">
                        {e.contactName}
                      </td>
                      <td className="px-4 py-2 text-neutral-500">
                        {formatDate(e.createdAt)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            e.status === "New"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {enquiryStatusLabel(e.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
