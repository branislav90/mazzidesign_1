// Wood material palette — MeshStandardMaterial tinted per species, roughness
// per finish (AGENTS.md §7). No textures, no network assets.

import * as THREE from "three";
import type { Finish, Species } from "@/lib/catalog";

export const SPECIES_COLORS: Record<Species, string> = {
  oak: "#B08552",
  walnut: "#5C3A22",
  ash: "#D9C5A2",
  smoked_oak: "#4C2E1A",
};

export const FINISH_ROUGHNESS: Record<Finish, number> = {
  oiled: 0.65,
  hardwax: 0.55,
  lacquered: 0.35,
};

/** Neutral "undecided" wood tone, used while species is null. */
const DEFAULT_COLOR = "#B89B72";
const DEFAULT_ROUGHNESS = 0.6;

export interface Palette {
  /** Door/front panels and primary surfaces. */
  front: THREE.MeshStandardMaterial;
  /** Carcass / structure — slightly darker. */
  carcass: THREE.MeshStandardMaterial;
  /** Worktops / treads — darker still. */
  top: THREE.MeshStandardMaterial;
  /** Light accent (mattress, upholstery hint). */
  light: THREE.MeshStandardMaterial;
  /** Painted wall backdrop for trim mode. */
  wall: THREE.MeshStandardMaterial;
  dispose: () => void;
}

function shade(hex: string, amount: number): THREE.Color {
  const color = new THREE.Color(hex);
  if (amount >= 0) return color.lerp(new THREE.Color("#ffffff"), amount);
  return color.lerp(new THREE.Color("#1a140e"), -amount);
}

export function createPalette(species: Species | null, finish: Finish | null): Palette {
  const base = species ? SPECIES_COLORS[species] : DEFAULT_COLOR;
  const roughness = finish ? FINISH_ROUGHNESS[finish] : DEFAULT_ROUGHNESS;

  const front = new THREE.MeshStandardMaterial({
    color: new THREE.Color(base),
    roughness,
    metalness: 0.02,
  });
  const carcass = new THREE.MeshStandardMaterial({
    color: shade(base, -0.18),
    roughness: Math.min(0.9, roughness + 0.12),
    metalness: 0.02,
  });
  const top = new THREE.MeshStandardMaterial({
    color: shade(base, -0.32),
    roughness,
    metalness: 0.02,
  });
  const light = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#EDE6DA"),
    roughness: 0.85,
    metalness: 0,
  });
  const wall = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#E9E2D5"),
    roughness: 0.95,
    metalness: 0,
  });

  const materials = [front, carcass, top, light, wall];
  return {
    front,
    carcass,
    top,
    light,
    wall,
    dispose: () => materials.forEach((m) => m.dispose()),
  };
}
