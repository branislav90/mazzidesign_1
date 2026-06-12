// Configurator UI strings — Slovenian first, English second.
// Locale comes from the "locale" cookie (sl | en, default sl), readable both
// server-side (passed as prop) and client-side via getClientLocale().

import type { StepId, Timeframe } from "@/lib/configurator/store";

export type Locale = "sl" | "en";

/** Client-side cookie read; safe during SSR (falls back to 'sl'). */
export function getClientLocale(): Locale {
  if (typeof document === "undefined") return "sl";
  const match = document.cookie.match(/(?:^|;\s*)locale=(sl|en)\b/);
  return match?.[1] === "en" ? "en" : "sl";
}

export interface ConfiguratorDict {
  brand: string;
  title: string;
  closeAria: string;
  progressAria: string;
  stepOf: (current: number, total: number) => string;
  steps: Record<StepId, { title: string; why: string }>;
  nav: { back: string; next: string; send: string; sending: string };
  notSure: string;
  notSureHint: string;
  dimensions: {
    mm: string;
    derivedTitle: string;
    linearMeters: string;
    frontAreaM2: string;
    boardVolumeM3: string;
    stepsCount: string;
    riser: string;
  };
  material: {
    speciesTitle: string;
    finishTitle: string;
    extrasTitle: string;
    speciesNotSure: string;
    finishNotSure: string;
  };
  review: {
    summaryTitle: string;
    category: string;
    item: string;
    shape: string;
    dimensions: string;
    material: string;
    extras: string;
    none: string;
    notSureValue: string;
    snapshotAlt: string;
    contactTitle: string;
    contactWhy: string;
    name: string;
    email: string;
    phone: string;
    town: string;
    timeframe: string;
    timeframes: Record<Timeframe, string>;
    timeframeNotSure: string;
    notes: string;
    notesPlaceholder: string;
    photos: string;
    photosHint: string;
    photosAdd: string;
    photoRemove: string;
    required: string;
    invalidEmail: string;
    photoTooLarge: string;
    photoWrongType: string;
    tooManyPhotos: string;
    errorRateLimit: string;
    errorNetwork: string;
    retry: string;
    privacy: string;
  };
  viewport: {
    silhouette: string;
    silhouetteAria: string;
    loading: string;
  };
  success: {
    title: string;
    reference: string;
    line: string;
    backHome: string;
    newEnquiry: string;
  };
}

export const CONFIGURATOR_DICT: Record<Locale, ConfiguratorDict> = {
  sl: {
    brand: "Mizarstvo",
    title: "Povpraševanje",
    closeAria: "Zapri konfigurator in se vrni na stran",
    progressAria: "Koraki konfiguratorja",
    stepOf: (c, t) => `Korak ${c} od ${t}`,
    steps: {
      category: {
        title: "Kaj potrebujete?",
        why: "Da vas usmerimo k pravim izdelkom — brez naročniških obveznosti.",
      },
      item: {
        title: "Izberite izdelek",
        why: "Vsak izdelek izdelamo po meri; izbira nam pove, kaj vam pokažemo.",
      },
      shape: {
        title: "Oblika in postavitev",
        why: "Oblika določa, kako se kos umesti v vaš prostor.",
      },
      dimensions: {
        title: "Mere",
        why: "Približne mere so dovolj — natančno izmerimo ob ogledu.",
      },
      material: {
        title: "Les in obdelava",
        why: "Vrsta lesa in obdelava določata značaj in nego kosa.",
      },
      review: {
        title: "Pregled in oddaja",
        why: "Preverite izbiro in nam zaupajte, kako vas dosežemo.",
      },
    },
    nav: { back: "Nazaj", next: "Naprej", send: "Pošlji povpraševanje", sending: "Pošiljam …" },
    notSure: "Nisem prepričan/a",
    notSureHint: "Pustite nam, da svetujemo — polje bo označeno kot odprto.",
    dimensions: {
      mm: "mm",
      derivedTitle: "Ocena obsega",
      linearMeters: "tekočih metrov",
      frontAreaM2: "m² front",
      boardVolumeM3: "m³ lesa (ocena)",
      stepsCount: "stopnic",
      riser: "mm višina stopnice",
    },
    material: {
      speciesTitle: "Vrsta lesa",
      finishTitle: "Površinska obdelava",
      extrasTitle: "Dodatki",
      speciesNotSure: "Glede lesa še nisem odločen/a",
      finishNotSure: "Glede obdelave še nisem odločen/a",
    },
    review: {
      summaryTitle: "Vaša izbira",
      category: "Kategorija",
      item: "Izdelek",
      shape: "Oblika",
      dimensions: "Mere",
      material: "Les in obdelava",
      extras: "Dodatki",
      none: "Brez",
      notSureValue: "Še odprto",
      snapshotAlt: "Predogled vaše konfiguracije",
      contactTitle: "Vaši podatki",
      contactWhy: "Odgovorimo v enem delovnem dnevu — podatkov ne delimo naprej.",
      name: "Ime in priimek",
      email: "E-pošta",
      phone: "Telefon",
      town: "Kraj (neobvezno)",
      timeframe: "Kdaj bi želeli izvedbo?",
      timeframes: {
        asap: "Čim prej",
        "1-3m": "V 1–3 mesecih",
        "3-6m": "V 3–6 mesecih",
        exploring: "Šele raziskujem",
      },
      timeframeNotSure: "Še ne vem",
      notes: "Sporočilo (neobvezno)",
      notesPlaceholder: "Posebne želje, opis prostora, vprašanja …",
      photos: "Fotografije prostora (neobvezno)",
      photosHint: "Do 3 fotografije, vsaka do 5 MB (JPEG, PNG ali WebP).",
      photosAdd: "Dodaj fotografije",
      photoRemove: "Odstrani fotografijo",
      required: "To polje je obvezno.",
      invalidEmail: "Vnesite veljaven e-poštni naslov.",
      photoTooLarge: "Fotografija presega 5 MB.",
      photoWrongType: "Dovoljene so le JPEG, PNG in WebP datoteke.",
      tooManyPhotos: "Dodate lahko največ 3 fotografije.",
      errorRateLimit:
        "Trenutno prejemamo veliko povpraševanj. Počakajte minuto in poskusite znova — vaša izbira je shranjena.",
      errorNetwork:
        "Povezave ni bilo mogoče vzpostaviti. Preverite internet in poskusite znova — vaša izbira je shranjena.",
      retry: "Poskusi znova",
      privacy: "Podatke uporabimo izključno za pripravo ponudbe.",
    },
    viewport: {
      silhouette: "Človek za merilo",
      silhouetteAria: "Prikaži ali skrij človeško silhueto za primerjavo velikosti",
      loading: "Nalagam predogled …",
    },
    success: {
      title: "Hvala za povpraševanje",
      reference: "Vaša referenčna številka",
      line: "Odgovorimo v enem delovnem dnevu.",
      backHome: "Na začetno stran",
      newEnquiry: "Novo povpraševanje",
    },
  },
  en: {
    brand: "Mizarstvo",
    title: "Enquiry",
    closeAria: "Close the configurator and return to the site",
    progressAria: "Configurator steps",
    stepOf: (c, t) => `Step ${c} of ${t}`,
    steps: {
      category: {
        title: "What do you need?",
        why: "So we can point you to the right pieces — no obligation.",
      },
      item: {
        title: "Pick the item",
        why: "Everything is made to order; this tells us what to show you.",
      },
      shape: {
        title: "Shape & layout",
        why: "The shape decides how the piece fits your space.",
      },
      dimensions: {
        title: "Dimensions",
        why: "Rough measurements are fine — we measure precisely on site.",
      },
      material: {
        title: "Wood & finish",
        why: "Species and finish define the character and care of the piece.",
      },
      review: {
        title: "Review & send",
        why: "Check your choices and tell us how to reach you.",
      },
    },
    nav: { back: "Back", next: "Next", send: "Send enquiry", sending: "Sending …" },
    notSure: "Not sure",
    notSureHint: "Leave it to us to advise — the field will be marked as open.",
    dimensions: {
      mm: "mm",
      derivedTitle: "Scope estimate",
      linearMeters: "linear metres",
      frontAreaM2: "m² of fronts",
      boardVolumeM3: "m³ of timber (est.)",
      stepsCount: "steps",
      riser: "mm riser height",
    },
    material: {
      speciesTitle: "Wood species",
      finishTitle: "Finish",
      extrasTitle: "Extras",
      speciesNotSure: "Not decided on the wood yet",
      finishNotSure: "Not decided on the finish yet",
    },
    review: {
      summaryTitle: "Your configuration",
      category: "Category",
      item: "Item",
      shape: "Shape",
      dimensions: "Dimensions",
      material: "Wood & finish",
      extras: "Extras",
      none: "None",
      notSureValue: "Still open",
      snapshotAlt: "Preview of your configuration",
      contactTitle: "Your details",
      contactWhy: "We reply within one working day — your details stay with us.",
      name: "Full name",
      email: "Email",
      phone: "Phone",
      town: "Town (optional)",
      timeframe: "When would you like it done?",
      timeframes: {
        asap: "As soon as possible",
        "1-3m": "Within 1–3 months",
        "3-6m": "Within 3–6 months",
        exploring: "Just exploring",
      },
      timeframeNotSure: "Not sure yet",
      notes: "Message (optional)",
      notesPlaceholder: "Special wishes, a note about the space, questions …",
      photos: "Photos of your space (optional)",
      photosHint: "Up to 3 photos, 5 MB each (JPEG, PNG or WebP).",
      photosAdd: "Add photos",
      photoRemove: "Remove photo",
      required: "This field is required.",
      invalidEmail: "Please enter a valid email address.",
      photoTooLarge: "This photo exceeds 5 MB.",
      photoWrongType: "Only JPEG, PNG and WebP files are allowed.",
      tooManyPhotos: "You can add at most 3 photos.",
      errorRateLimit:
        "We are receiving many enquiries right now. Please wait a minute and try again — your configuration is saved.",
      errorNetwork:
        "We could not reach the server. Check your connection and try again — your configuration is saved.",
      retry: "Try again",
      privacy: "We use your details solely to prepare a quote.",
    },
    viewport: {
      silhouette: "Human for scale",
      silhouetteAria: "Show or hide a human silhouette for size reference",
      loading: "Loading preview …",
    },
    success: {
      title: "Thank you for your enquiry",
      reference: "Your reference number",
      line: "We reply within one working day.",
      backHome: "Back to the site",
      newEnquiry: "New enquiry",
    },
  },
};
