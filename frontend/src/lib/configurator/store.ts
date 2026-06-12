// Configurator state — the store IS the enquiry payload (AGENTS.md §8),
// plus wizard UI state. Every configuration value may be null = "not sure";
// only contact info is required at submit time.

import { create } from "zustand";
import type { CategoryId, Finish, Species } from "@/lib/catalog";
import { getItem } from "@/lib/catalog";

export type StepId =
  | "category"
  | "item"
  | "shape"
  | "dimensions"
  | "material"
  | "review";

export const ALL_STEPS: StepId[] = [
  "category",
  "item",
  "shape",
  "dimensions",
  "material",
  "review",
];

export type Timeframe = "asap" | "1-3m" | "3-6m" | "exploring";

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  town: string | null;
}

export interface ConfiguratorState {
  // --- payload (contract §8) -----------------------------------------------
  category: CategoryId | null;
  itemType: string | null;
  shape: string | null;
  dimensionsMm: Record<string, number | null>;
  material: { species: Species | null; finish: Finish | null };
  extras: string[];
  snapshotDataUrl: string | null;
  contact: ContactInfo;
  timeframe: Timeframe | null;
  notes: string | null;
  /** MediaAsset GUIDs returned by POST /api/enquiries/photos */
  photoIds: string[];
  locale: "sl" | "en";

  // --- UI state --------------------------------------------------------------
  step: StepId;
  /** Highest step index the customer has reached (for jump-back navigation). */
  maxStepIndex: number;
  showSilhouette: boolean;

  // --- actions ----------------------------------------------------------------
  setLocale: (locale: "sl" | "en") => void;
  setCategory: (category: CategoryId) => void;
  setItemType: (itemType: string) => void;
  setShape: (shape: string | null) => void;
  setDimension: (key: string, value: number | null) => void;
  setSpecies: (species: Species | null) => void;
  setFinish: (finish: Finish | null) => void;
  toggleExtra: (extraId: string) => void;
  setContactField: (field: keyof ContactInfo, value: string) => void;
  setTimeframe: (timeframe: Timeframe | null) => void;
  setNotes: (notes: string | null) => void;
  setSnapshot: (dataUrl: string | null) => void;
  setPhotoIds: (ids: string[]) => void;
  toggleSilhouette: () => void;
  goToStep: (step: StepId) => void;
  reset: () => void;
}

const initialPayload = {
  category: null as CategoryId | null,
  itemType: null as string | null,
  shape: null as string | null,
  dimensionsMm: {} as Record<string, number | null>,
  material: { species: null, finish: null } as {
    species: Species | null;
    finish: Finish | null;
  },
  extras: [] as string[],
  snapshotDataUrl: null as string | null,
  contact: { name: "", email: "", phone: "", town: null } as ContactInfo,
  timeframe: null as Timeframe | null,
  notes: null as string | null,
  photoIds: [] as string[],
};

export const useConfigurator = create<ConfiguratorState>()((set) => ({
  ...initialPayload,
  locale: "sl",

  step: "category",
  maxStepIndex: 0,
  showSilhouette: false,

  setLocale: (locale) => set({ locale }),

  setCategory: (category) =>
    set((s) => {
      if (s.category === category) return { category };
      // changing category invalidates everything downstream
      return {
        category,
        itemType: null,
        shape: null,
        dimensionsMm: {},
        extras: [],
        snapshotDataUrl: null,
      };
    }),

  setItemType: (itemType) =>
    set((s) => {
      if (s.itemType === itemType) return { itemType };
      const item = getItem(s.category, itemType);
      const dimensionsMm: Record<string, number | null> = {};
      if (item) {
        for (const [key, spec] of Object.entries(item.dimensionsMm)) {
          dimensionsMm[key] = spec.default;
        }
      }
      return {
        itemType,
        shape: item && item.shapes.length > 0 ? item.shapes[0].id : null,
        dimensionsMm,
        extras: [],
        snapshotDataUrl: null,
      };
    }),

  setShape: (shape) => set({ shape }),

  setDimension: (key, value) =>
    set((s) => ({ dimensionsMm: { ...s.dimensionsMm, [key]: value } })),

  setSpecies: (species) =>
    set((s) => ({ material: { ...s.material, species } })),

  setFinish: (finish) => set((s) => ({ material: { ...s.material, finish } })),

  toggleExtra: (extraId) =>
    set((s) => ({
      extras: s.extras.includes(extraId)
        ? s.extras.filter((e) => e !== extraId)
        : [...s.extras, extraId],
    })),

  setContactField: (field, value) =>
    set((s) => ({
      contact: {
        ...s.contact,
        [field]: field === "town" ? (value.trim() === "" ? null : value) : value,
      },
    })),

  setTimeframe: (timeframe) => set({ timeframe }),

  setNotes: (notes) =>
    set({ notes: notes && notes.trim() !== "" ? notes : null }),

  setSnapshot: (snapshotDataUrl) => set({ snapshotDataUrl }),

  setPhotoIds: (photoIds) => set({ photoIds }),

  toggleSilhouette: () => set((s) => ({ showSilhouette: !s.showSilhouette })),

  goToStep: (step) => {
    const index = ALL_STEPS.indexOf(step);
    set((s) => ({ step, maxStepIndex: Math.max(s.maxStepIndex, index) }));
  },

  reset: () =>
    set({
      ...initialPayload,
      step: "category",
      maxStepIndex: 0,
    }),
}));

// ---------------------------------------------------------------------------
// Navigation helpers (shape step is skipped for items without shapes)
// ---------------------------------------------------------------------------

/** Ordered visible steps for the current item (shape step may be skipped). */
export function visibleSteps(state: Pick<ConfiguratorState, "category" | "itemType">): StepId[] {
  const item = getItem(state.category, state.itemType);
  if (item && item.shapes.length === 0) {
    return ALL_STEPS.filter((s) => s !== "shape");
  }
  return ALL_STEPS;
}

/** Whether a step's prerequisites are satisfied (used for jump navigation). */
export function isStepReachable(
  state: Pick<ConfiguratorState, "category" | "itemType" | "maxStepIndex">,
  step: StepId,
): boolean {
  const index = ALL_STEPS.indexOf(step);
  if (index > state.maxStepIndex) return false;
  if (index >= 1 && !state.category) return false;
  if (index >= 2 && !state.itemType) return false;
  return true;
}
