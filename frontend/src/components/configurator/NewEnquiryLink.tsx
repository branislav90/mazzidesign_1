"use client";

import Link from "next/link";
import { useConfigurator } from "@/lib/configurator/store";

/** "New enquiry" link that clears the previous configuration first. */
export function NewEnquiryLink({ label }: { label: string }) {
  const reset = useConfigurator((s) => s.reset);
  return (
    <Link
      href="/configure"
      onClick={() => reset()}
      className="caps transition-colors hover:text-ink"
    >
      {label}
    </Link>
  );
}
