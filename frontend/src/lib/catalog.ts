// Product catalog: Category → ItemType → { shapes, dimensions, extras }.
// Seeded per AGENTS.md §6 in Milestone 5; ids are stable and appear in enquiry payloads.

export type CategoryId =
  | "kitchen-dining"
  | "closet-storage"
  | "living-bedroom"
  | "millwork"
  | "outdoor-garden";

export type Species = "oak" | "walnut" | "ash" | "smoked_oak";
export type Finish = "oiled" | "lacquered" | "hardwax";

export interface DimensionSpec {
  min: number;
  default: number;
  max: number;
  /** millimetres */
  unit: "mm";
}

export interface ItemType {
  id: string;
  shapes: string[];
  dimensions: Record<string, DimensionSpec>;
  extras: string[];
}

export interface Category {
  id: CategoryId;
  items: ItemType[];
}

// Populated in Milestone 5 (configurator catalog + store + wizard shell).
export const catalog: Category[] = [];
