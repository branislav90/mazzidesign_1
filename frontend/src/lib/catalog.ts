// Product catalog: Category → ItemType → { shapes, dimensions, extras }.
// Implements AGENTS.md §6 exactly — every item group from the brief, with
// stable ids that appear verbatim in enquiry payloads (contract §8).
// Slovenian first, English second.

export type CategoryId =
  | "kitchen-dining"
  | "closet-storage"
  | "living-bedroom"
  | "millwork"
  | "outdoor-garden";

export type Species = "oak" | "walnut" | "ash" | "smoked_oak";
export type Finish = "oiled" | "lacquered" | "hardwax";

/** Which parametric 3D generator renders this item. */
export type GeneratorKey =
  | "kitchen"
  | "wardrobe"
  | "table"
  | "bed"
  | "stairs"
  | "pergola"
  | "box"
  | "trim"
  | "seat";

export interface LocalizedText {
  sl: string;
  en: string;
}

export interface DimensionSpec {
  /** millimetres */
  min: number;
  default: number;
  max: number;
}

export interface ShapeDef {
  id: string;
  name: LocalizedText;
}

export interface ExtraDef {
  id: string;
  name: LocalizedText;
}

export interface ItemDef {
  id: string;
  name: LocalizedText;
  /** Friendly one-liner listing what falls under this item group. */
  description: LocalizedText;
  generator: GeneratorKey;
  /** Empty array → the shape step is skipped for this item. */
  shapes: ShapeDef[];
  /** Axis key → spec. Keys are the keys of the enquiry `dimensionsMm` record. */
  dimensionsMm: Record<string, DimensionSpec>;
  extras: ExtraDef[];
}

export interface CategoryDef {
  id: CategoryId;
  name: LocalizedText;
  /** Subcategory preview text shown on the category card. */
  description: LocalizedText;
  items: ItemDef[];
}

/** Localized labels for every dimension axis key used in the catalog. */
export const DIMENSION_LABELS: Record<string, LocalizedText> = {
  width: { sl: "Širina", en: "Width" },
  depth: { sl: "Globina", en: "Depth" },
  height: { sl: "Višina", en: "Height" },
  length: { sl: "Dolžina", en: "Length" },
  thickness: { sl: "Debelina", en: "Thickness" },
  seatHeight: { sl: "Višina sedišča", en: "Seat height" },
  headboardHeight: { sl: "Višina vzglavja", en: "Headboard height" },
  totalRise: { sl: "Skupna višina vzpona", en: "Total rise" },
  runningLength: { sl: "Skupna dolžina (tekoči metri)", en: "Total running length" },
  profileHeight: { sl: "Višina profila", en: "Profile height" },
};

export const SPECIES_LIST: Species[] = ["oak", "walnut", "ash", "smoked_oak"];
export const FINISH_LIST: Finish[] = ["oiled", "hardwax", "lacquered"];

export const SPECIES_LABELS: Record<Species, LocalizedText> = {
  oak: { sl: "Hrast", en: "Oak" },
  walnut: { sl: "Oreh", en: "Walnut" },
  ash: { sl: "Jesen", en: "Ash" },
  smoked_oak: { sl: "Dimljen hrast", en: "Smoked oak" },
};

export const FINISH_LABELS: Record<Finish, LocalizedText> = {
  oiled: { sl: "Oljen", en: "Oiled" },
  hardwax: { sl: "Trdi vosek", en: "Hardwax" },
  lacquered: { sl: "Lakiran", en: "Lacquered" },
};

// ---------------------------------------------------------------------------
// Catalog data
// ---------------------------------------------------------------------------

export const catalog: CategoryDef[] = [
  {
    id: "kitchen-dining",
    name: { sl: "Kuhinja in jedilnica", en: "Kitchen & Dining" },
    description: {
      sl: "Kuhinjski elementi po meri, izvlečni sistemi shranjevanja ter masivne deske in posode.",
      en: "Custom cabinetry, pull-out storage systems, and solid-wood boards and bowls.",
    },
    items: [
      {
        id: "cabinetry",
        name: { sl: "Kuhinjski elementi", en: "Cabinetry" },
        description: {
          sl: "Otoki po meri, visoke shrambne omare, viseče police.",
          en: "Custom island units, pantry cupboards, overhead shelving.",
        },
        generator: "kitchen",
        shapes: [
          { id: "straight", name: { sl: "Ravna linija", en: "Straight run" } },
          { id: "l-shaped", name: { sl: "L-oblika", en: "L-shaped" } },
          { id: "u-shaped", name: { sl: "U-oblika", en: "U-shaped" } },
          { id: "galley", name: { sl: "Vzporedna (galley)", en: "Galley" } },
          { id: "island", name: { sl: "Z otokom", en: "With island" } },
        ],
        dimensionsMm: {
          width: { min: 1200, default: 3000, max: 6000 },
          depth: { min: 500, default: 600, max: 800 },
          height: { min: 1400, default: 2200, max: 2600 },
        },
        extras: [
          { id: "soft-close", name: { sl: "Mehko zapiranje", en: "Soft-close hinges" } },
          { id: "led-interior", name: { sl: "LED notranja osvetlitev", en: "LED interior lighting" } },
          { id: "spice-racks", name: { sl: "Izvlečne police za začimbe", en: "Pull-out spice racks" } },
          { id: "drawer-organizers", name: { sl: "Organizatorji predalov", en: "Drawer organizers" } },
          { id: "wine-rack", name: { sl: "Vinska polica", en: "Wine rack" } },
          { id: "integrated-bins", name: { sl: "Vgrajeni koši za odpadke", en: "Integrated waste bins" } },
        ],
      },
      {
        id: "kitchen-storage",
        name: { sl: "Shranjevanje", en: "Storage" },
        description: {
          sl: "Izvlečne police za začimbe, organizatorji predalov po meri, vinske police.",
          en: "Pull-out spice racks, custom drawer organizers, wine racks.",
        },
        generator: "box",
        shapes: [],
        dimensionsMm: {
          width: { min: 200, default: 500, max: 1200 },
          depth: { min: 250, default: 500, max: 600 },
          height: { min: 80, default: 200, max: 800 },
        },
        extras: [
          { id: "soft-close", name: { sl: "Mehko zapiranje", en: "Soft-close runners" } },
          { id: "felt-lining", name: { sl: "Obloga iz filca", en: "Felt lining" } },
          { id: "adjustable-dividers", name: { sl: "Nastavljive pregrade", en: "Adjustable dividers" } },
        ],
      },
      {
        id: "serveware",
        name: { sl: "Kuhinjski pripomočki", en: "Serveware" },
        description: {
          sl: "Masivne rezalne deske, lesene sklede, stojala za nože po meri.",
          en: "Heavy-duty cutting boards, wooden bowls, custom knife blocks.",
        },
        generator: "box",
        shapes: [],
        dimensionsMm: {
          length: { min: 200, default: 450, max: 900 },
          width: { min: 150, default: 300, max: 600 },
          thickness: { min: 20, default: 40, max: 80 },
        },
        extras: [
          { id: "juice-groove", name: { sl: "Utor za sok", en: "Juice groove" } },
          { id: "handle-cutouts", name: { sl: "Izrezana ročaja", en: "Handle cut-outs" } },
          { id: "engraving", name: { sl: "Gravura", en: "Engraving" } },
        ],
      },
    ],
  },
  {
    id: "closet-storage",
    name: { sl: "Garderoba in shranjevanje", en: "Closet & Storage" },
    description: {
      sl: "Vgradne garderobne sobe, samostoječe omare ter skrinje in zaboji.",
      en: "Walk-in closets, freestanding wardrobes, chests and boxes.",
    },
    items: [
      {
        id: "walk-in-closet",
        name: { sl: "Garderobna soba", en: "Walk-in closet" },
        description: {
          sl: "Vgradne police za čevlje, obešalni deli po meri, predalniki-otoki.",
          en: "Built-in shoe racks, customized hanging sections, dresser islands.",
        },
        generator: "wardrobe",
        shapes: [
          { id: "straight", name: { sl: "Ravna stena", en: "Straight wall" } },
          { id: "corner-l", name: { sl: "Kotna L-postavitev", en: "Corner L" } },
          { id: "walk-in-u", name: { sl: "U-postavitev (walk-in)", en: "Walk-in U" } },
        ],
        dimensionsMm: {
          width: { min: 1000, default: 3200, max: 6000 },
          depth: { min: 500, default: 600, max: 750 },
          height: { min: 2000, default: 2400, max: 2800 },
        },
        extras: [
          { id: "shoe-section", name: { sl: "Odprt del za čevlje", en: "Open shoe section" } },
          { id: "led-interior", name: { sl: "LED notranja osvetlitev", en: "LED interior lighting" } },
          { id: "soft-close", name: { sl: "Mehko zapiranje", en: "Soft-close hardware" } },
          { id: "drawer-organizers", name: { sl: "Organizatorji predalov", en: "Drawer organizers" } },
          { id: "dresser-island", name: { sl: "Predalnik-otok", en: "Dresser island" } },
          { id: "mirror-door", name: { sl: "Ogledalo na vratih", en: "Mirror door" } },
        ],
      },
      {
        id: "wardrobe",
        name: { sl: "Omara", en: "Wardrobe" },
        description: {
          sl: "Samostoječe omare, omare za posteljnino, garderobe za hodnik.",
          en: "Freestanding armoires, linen closets, hallway coat storage.",
        },
        generator: "wardrobe",
        shapes: [
          { id: "straight", name: { sl: "Ravna", en: "Straight" } },
          { id: "corner-l", name: { sl: "Kotna L", en: "Corner L" } },
          { id: "walk-in-u", name: { sl: "U-postavitev", en: "Walk-in U" } },
        ],
        dimensionsMm: {
          width: { min: 1000, default: 2400, max: 6000 },
          depth: { min: 550, default: 600, max: 700 },
          height: { min: 2000, default: 2200, max: 2800 },
        },
        extras: [
          { id: "soft-close", name: { sl: "Mehko zapiranje", en: "Soft-close hardware" } },
          { id: "led-interior", name: { sl: "LED notranja osvetlitev", en: "LED interior lighting" } },
          { id: "shoe-section", name: { sl: "Odprt del za čevlje", en: "Open shoe section" } },
          { id: "internal-drawers", name: { sl: "Notranji predali", en: "Internal drawers" } },
          { id: "double-rail", name: { sl: "Dvojna obešalna palica", en: "Double hanging rail" } },
        ],
      },
      {
        id: "utility-box",
        name: { sl: "Skrinja ali zaboj", en: "Utility box" },
        description: {
          sl: "Skrinje za odeje, zaboji za igrače, dekorativni kovčki.",
          en: "Blanket chests, toy boxes, decorative trunks.",
        },
        generator: "box",
        shapes: [],
        dimensionsMm: {
          length: { min: 600, default: 1000, max: 1500 },
          width: { min: 350, default: 500, max: 700 },
          height: { min: 350, default: 550, max: 800 },
        },
        extras: [
          { id: "soft-close-lid", name: { sl: "Mehko zapiranje pokrova", en: "Soft-close lid" } },
          { id: "casters", name: { sl: "Kolesca", en: "Casters" } },
          { id: "internal-tray", name: { sl: "Notranji pladenj", en: "Internal tray" } },
          { id: "lock", name: { sl: "Ključavnica", en: "Lock" } },
        ],
      },
    ],
  },
  {
    id: "living-bedroom",
    name: { sl: "Dnevna soba in spalnica", en: "Living & Bedroom" },
    description: {
      sl: "Sedežno pohištvo, mize in pisalne mize ter postelje po meri.",
      en: "Seating, tables and desks, custom beds.",
    },
    items: [
      {
        id: "seating",
        name: { sl: "Sedežno pohištvo", en: "Seating" },
        description: {
          sl: "Jedilni stoli, klopi, pručke, ogrodja naslanjačev.",
          en: "Dining chairs, benches, stools, armchair frames.",
        },
        generator: "seat",
        shapes: [
          { id: "chair", name: { sl: "Stol", en: "Chair" } },
          { id: "bench", name: { sl: "Klop", en: "Bench" } },
          { id: "stool", name: { sl: "Pručka", en: "Stool" } },
        ],
        dimensionsMm: {
          width: { min: 350, default: 450, max: 2400 },
          depth: { min: 350, default: 450, max: 600 },
          seatHeight: { min: 400, default: 450, max: 500 },
        },
        extras: [
          { id: "armrests", name: { sl: "Naslonjala za roke", en: "Armrests" } },
          { id: "upholstery-ready", name: { sl: "Priprava za oblazinjenje", en: "Upholstery-ready seat" } },
          { id: "matching-set", name: { sl: "Komplet več kosov", en: "Matching set" } },
        ],
      },
      {
        id: "tables",
        name: { sl: "Mize", en: "Tables" },
        description: {
          sl: "Klubske mizice, stranske mizice, pisalne mize, velike jedilne mize.",
          en: "Coffee tables, side tables, desks, large dining tables.",
        },
        generator: "table",
        shapes: [
          { id: "rectangular", name: { sl: "Pravokotna", en: "Rectangular" } },
          { id: "round", name: { sl: "Okrogla", en: "Round" } },
          { id: "oval", name: { sl: "Ovalna", en: "Oval" } },
        ],
        dimensionsMm: {
          length: { min: 1200, default: 2000, max: 3200 },
          width: { min: 700, default: 950, max: 1200 },
          height: { min: 400, default: 740, max: 1100 },
        },
        extras: [
          { id: "trestle-base", name: { sl: "Podnožje na kobilici", en: "Trestle base" } },
          { id: "extension-leaf", name: { sl: "Podaljšek plošče", en: "Extension leaf" } },
          { id: "cable-grommet", name: { sl: "Odprtina za kable", en: "Cable grommet" } },
          { id: "matching-bench", name: { sl: "Klop v kompletu", en: "Matching bench" } },
        ],
      },
      {
        id: "bedding",
        name: { sl: "Postelje", en: "Bedding" },
        description: {
          sl: "Posteljni okvirji po meri, vzglavja, nočne omarice.",
          en: "Custom bed frames, headboards, nightstands.",
        },
        generator: "bed",
        shapes: [],
        dimensionsMm: {
          width: { min: 900, default: 1600, max: 2000 },
          length: { min: 1900, default: 2000, max: 2200 },
          headboardHeight: { min: 600, default: 1000, max: 1500 },
        },
        extras: [
          { id: "nightstands", name: { sl: "Nočni omarici", en: "Nightstands" } },
          { id: "under-bed-drawers", name: { sl: "Predali pod posteljo", en: "Under-bed drawers" } },
          { id: "led-backlight", name: { sl: "LED osvetlitev vzglavja", en: "Headboard LED backlight" } },
          { id: "floating-look", name: { sl: "Lebdeči videz", en: "Floating look" } },
        ],
      },
    ],
  },
  {
    id: "millwork",
    name: { sl: "Stavbno pohištvo in obloge", en: "Architectural & Millwork" },
    description: {
      sl: "Letvice in obrobe, vgradni elementi ter stopnice, vrata in okna.",
      en: "Trim work, built-in fixtures, staircases, doors and windows.",
    },
    items: [
      {
        id: "trim-work",
        name: { sl: "Letvice in obrobe", en: "Trim work" },
        description: {
          sl: "Stropne letve, talne obrobe, okenske obrobe, stenske obloge.",
          en: "Crown molding, baseboards, window casings, wainscoting.",
        },
        generator: "trim",
        shapes: [],
        dimensionsMm: {
          runningLength: { min: 1000, default: 10000, max: 60000 },
          profileHeight: { min: 40, default: 120, max: 300 },
        },
        extras: [
          { id: "paint-ready", name: { sl: "Pripravljeno za barvanje", en: "Paint-ready" } },
          { id: "mitred-corners", name: { sl: "Vnaprej rezani koti", en: "Pre-cut mitred corners" } },
          { id: "wainscot-panels", name: { sl: "Stenski paneli", en: "Wainscot panels" } },
        ],
      },
      {
        id: "fixtures",
        name: { sl: "Vgradni elementi", en: "Fixtures" },
        description: {
          sl: "Lebdeče knjižne police, kaminske police, maske za radiatorje.",
          en: "Floating bookshelves, fireplace mantels, radiator covers.",
        },
        generator: "box",
        shapes: [],
        dimensionsMm: {
          width: { min: 400, default: 1500, max: 3000 },
          depth: { min: 100, default: 250, max: 500 },
          height: { min: 50, default: 250, max: 1200 },
        },
        extras: [
          { id: "hidden-brackets", name: { sl: "Skriti nosilci", en: "Hidden brackets" } },
          { id: "led-strip", name: { sl: "LED trak", en: "LED strip" } },
          { id: "cable-channel", name: { sl: "Kanal za kable", en: "Cable channel" } },
        ],
      },
      {
        id: "structural",
        name: { sl: "Stopnice in konstrukcije", en: "Structural" },
        description: {
          sl: "Lesene stopnice, ograje in ročaji, vrata, okenski okvirji.",
          en: "Wooden staircases, handrails, doors, window frames.",
        },
        generator: "stairs",
        shapes: [
          { id: "straight", name: { sl: "Ravne", en: "Straight" } },
          { id: "quarter-turn", name: { sl: "Z zavojem 90°", en: "Quarter turn" } },
          { id: "half-turn", name: { sl: "Z zavojem 180°", en: "Half turn" } },
        ],
        dimensionsMm: {
          totalRise: { min: 2400, default: 2700, max: 3500 },
          width: { min: 700, default: 1000, max: 1400 },
        },
        extras: [
          { id: "handrail", name: { sl: "Ročaj", en: "Handrail" } },
          { id: "closed-risers", name: { sl: "Zaprta čela stopnic", en: "Closed risers" } },
          { id: "anti-slip", name: { sl: "Protizdrsni utori", en: "Anti-slip grooves" } },
          { id: "matching-landing", name: { sl: "Podest v enakem lesu", en: "Matching landing" } },
        ],
      },
    ],
  },
  {
    id: "outdoor-garden",
    name: { sl: "Zunanjost in vrt", en: "Outdoor & Garden" },
    description: {
      sl: "Pergole in vrtne konstrukcije, vrtno pohištvo ter korita in gredice.",
      en: "Pergolas and garden structures, outdoor furniture, planters.",
    },
    items: [
      {
        id: "structures",
        name: { sl: "Konstrukcije", en: "Structures" },
        description: {
          sl: "Pergole, paviljoni, vrtne ute, terase.",
          en: "Pergolas, gazebos, garden sheds, decking.",
        },
        generator: "pergola",
        shapes: [
          { id: "freestanding", name: { sl: "Samostoječa", en: "Freestanding" } },
          { id: "wall-mounted", name: { sl: "Prislonjena ob steno", en: "Wall-mounted" } },
        ],
        dimensionsMm: {
          width: { min: 2000, default: 3500, max: 6000 },
          depth: { min: 2000, default: 3000, max: 6000 },
          height: { min: 2100, default: 2400, max: 2800 },
        },
        extras: [
          { id: "slatted-roof", name: { sl: "Letvena streha", en: "Slatted roof" } },
          { id: "side-lattice", name: { sl: "Stranska mreža", en: "Side lattice" } },
          { id: "integrated-bench", name: { sl: "Vgrajena klop", en: "Integrated bench" } },
          { id: "plant-wires", name: { sl: "Žice za vzpenjavke", en: "Climbing-plant wires" } },
        ],
      },
      {
        id: "outdoor-furniture",
        name: { sl: "Vrtno pohištvo", en: "Outdoor furniture" },
        description: {
          sl: "Vrtne mize, stoli Adirondack, gugalnice za verando.",
          en: "Patio tables, Adirondack chairs, porch swings.",
        },
        generator: "table",
        shapes: [
          { id: "rectangular", name: { sl: "Pravokotna", en: "Rectangular" } },
          { id: "round", name: { sl: "Okrogla", en: "Round" } },
        ],
        dimensionsMm: {
          length: { min: 1200, default: 1800, max: 2400 },
          width: { min: 700, default: 900, max: 1100 },
          height: { min: 400, default: 740, max: 1100 },
        },
        extras: [
          { id: "weather-oil", name: { sl: "Zaščitno olje za zunaj", en: "Weatherproof oil" } },
          { id: "umbrella-hole", name: { sl: "Odprtina za senčnik", en: "Umbrella hole" } },
          { id: "matching-benches", name: { sl: "Klopi v kompletu", en: "Matching benches" } },
        ],
      },
      {
        id: "planters",
        name: { sl: "Korita in gredice", en: "Planters" },
        description: {
          sl: "Masivna okenska korita, dvignjene gredice.",
          en: "Heavy-duty window boxes, raised garden beds.",
        },
        generator: "box",
        shapes: [],
        dimensionsMm: {
          length: { min: 400, default: 1200, max: 3000 },
          width: { min: 200, default: 400, max: 1200 },
          height: { min: 150, default: 300, max: 900 },
        },
        extras: [
          { id: "drainage", name: { sl: "Odprtine za odtekanje", en: "Drainage holes" } },
          { id: "liner", name: { sl: "Notranja folija", en: "Liner" } },
          { id: "trellis", name: { sl: "Opora za rastline", en: "Trellis" } },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getCategory(id: CategoryId | string | null): CategoryDef | null {
  if (!id) return null;
  return catalog.find((c) => c.id === id) ?? null;
}

export function getItem(
  categoryId: CategoryId | string | null,
  itemId: string | null,
): ItemDef | null {
  const category = getCategory(categoryId);
  if (!category || !itemId) return null;
  return category.items.find((i) => i.id === itemId) ?? null;
}

export function getShape(item: ItemDef | null, shapeId: string | null): ShapeDef | null {
  if (!item || !shapeId) return null;
  return item.shapes.find((s) => s.id === shapeId) ?? null;
}
