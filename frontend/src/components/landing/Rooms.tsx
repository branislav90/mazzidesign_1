"use client";

// Rooms — renders the variant chosen by the on-page design switcher.
import type { RoomsSection } from "@/lib/api/content";
import { useDesign } from "./DesignContext";
import RoomsStack from "./RoomsStack";
import RoomsClassic from "./RoomsClassic";

export default function Rooms({
  section,
  heading,
}: {
  section: RoomsSection;
  heading: { label: string; title: string };
}) {
  const { design } = useDesign();
  return design === "classic" ? (
    <RoomsClassic section={section} />
  ) : (
    <RoomsStack section={section} heading={heading} />
  );
}
