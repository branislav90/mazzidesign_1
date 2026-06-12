"use client";

// Simple enquiry: free-text message + contact + up to 3 photos. Submits
// through the same pipeline as the configurator (category/itemType 'general'),
// so it lands in the admin inbox and the workshop email like any other enquiry.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  EnquiryError,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  PHOTO_TYPES,
  submitEnquiry,
  uploadEnquiryPhotos,
} from "@/lib/api/enquiries";
import type { Locale } from "@/lib/configurator/i18n";

const DICT = {
  sl: {
    label: "Preprosto povpraševanje",
    title: "Povejte nam, kaj potrebujete",
    intro:
      "Opišite kos ali prostor, dodajte mere, če jih poznate, in priložite fotografije. Odgovorimo v enem delovnem dnevu.",
    message: "Vaše sporočilo",
    messagePlaceholder:
      "Npr.: Želimo vgradno omaro v hodniku, dolžina stene približno 2,4 m …",
    name: "Ime in priimek",
    email: "E-pošta",
    phone: "Telefon",
    town: "Kraj (neobvezno)",
    timeframe: "Kdaj bi želeli izvedbo?",
    timeframes: {
      "": "Izberite (neobvezno)",
      asap: "Čim prej",
      "1-3m": "V 1–3 mesecih",
      "3-6m": "V 3–6 mesecih",
      exploring: "Šele raziskujem",
    },
    photos: "Fotografije (do 3, največ 5 MB)",
    addPhoto: "Dodaj fotografijo",
    removePhoto: "Odstrani",
    send: "Pošlji povpraševanje",
    sending: "Pošiljanje …",
    back: "← Nazaj na izbiro",
    required: "Izpolnite sporočilo, ime, e-pošto in telefon.",
    photoTooBig: "Fotografija presega 5 MB.",
    photoWrongType: "Dovoljene so slike JPG, PNG ali WebP.",
    errRate: "Preveč poskusov — počakajte minuto in poskusite znova.",
    errNetwork: "Povezava ni uspela. Preverite internet in poskusite znova.",
    errServer: "Pri pošiljanju je prišlo do napake. Poskusite znova.",
  },
  en: {
    label: "Simple enquiry",
    title: "Tell us what you need",
    intro:
      "Describe the piece or the room, add measurements if you know them, and attach photos. We reply within one working day.",
    message: "Your message",
    messagePlaceholder:
      "E.g.: We would like a built-in hallway wardrobe, wall roughly 2.4 m long …",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    town: "Town (optional)",
    timeframe: "When would you like it built?",
    timeframes: {
      "": "Select (optional)",
      asap: "As soon as possible",
      "1-3m": "Within 1–3 months",
      "3-6m": "Within 3–6 months",
      exploring: "Just exploring",
    },
    photos: "Photos (up to 3, max 5 MB each)",
    addPhoto: "Add photo",
    removePhoto: "Remove",
    send: "Send enquiry",
    sending: "Sending …",
    back: "← Back to options",
    required: "Please fill in the message, name, email and phone.",
    photoTooBig: "Photo exceeds 5 MB.",
    photoWrongType: "Only JPG, PNG or WebP images are allowed.",
    errRate: "Too many attempts — wait a minute and try again.",
    errNetwork: "Connection failed. Check your internet and try again.",
    errServer: "Something went wrong while sending. Please try again.",
  },
} as const;

const inputCls =
  "w-full rounded-[10px] border border-line bg-white/60 px-4 py-3 text-[15px] text-ink outline-none transition-colors duration-300 placeholder:text-soft/60 focus:border-ink";

export default function PlainEnquiryForm({ locale }: { locale: Locale }) {
  const t = DICT[locale];
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [town, setTown] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_PHOTOS) break;
      if (!PHOTO_TYPES.includes(file.type)) {
        setError(t.photoWrongType);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setError(t.photoTooBig);
        continue;
      }
      next.push(file);
    }
    setFiles(next);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!message.trim() || !name.trim() || !email.trim() || !phone.trim()) {
      setError(t.required);
      return;
    }
    setSending(true);
    try {
      const uploaded = await uploadEnquiryPhotos(files);
      const reference = await submitEnquiry({
        category: "general",
        itemType: "general",
        shape: null,
        dimensionsMm: {},
        derived: {},
        material: { species: null, finish: null },
        extras: [],
        snapshotDataUrl: null,
        contact: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          town: town.trim() || null,
        },
        timeframe: (timeframe || null) as
          | "asap"
          | "1-3m"
          | "3-6m"
          | "exploring"
          | null,
        notes: message.trim(),
        photos: uploaded.map((p) => p.id),
        locale,
      });
      router.push(`/configure/success?ref=${encodeURIComponent(reference)}`);
    } catch (err) {
      const kind = err instanceof EnquiryError ? err.kind : "server";
      setError(
        kind === "rate-limit"
          ? t.errRate
          : kind === "network"
            ? t.errNetwork
            : t.errServer,
      );
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-16">
      <p className="caps">{t.label}</p>
      <h1 className="mt-5 font-serif text-[clamp(30px,4.4vw,52px)] font-normal leading-[1.1]">
        {t.title}
      </h1>
      <p className="mt-4 max-w-[52ch] text-[15.5px] leading-relaxed text-soft">
        {t.intro}
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
        <div>
          <label htmlFor="pe-message" className="caps mb-2 block">
            {t.message} *
          </label>
          <textarea
            id="pe-message"
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.messagePlaceholder}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="pe-name" className="caps mb-2 block">
              {t.name} *
            </label>
            <input
              id="pe-name"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="pe-email" className="caps mb-2 block">
              {t.email} *
            </label>
            <input
              id="pe-email"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="pe-phone" className="caps mb-2 block">
              {t.phone} *
            </label>
            <input
              id="pe-phone"
              required
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="pe-town" className="caps mb-2 block">
              {t.town}
            </label>
            <input
              id="pe-town"
              autoComplete="address-level2"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="pe-timeframe" className="caps mb-2 block">
            {t.timeframe}
          </label>
          <select
            id="pe-timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className={inputCls}
          >
            {Object.entries(t.timeframes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="caps mb-2 block">{t.photos}</span>
          <input
            ref={fileRef}
            type="file"
            accept={PHOTO_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="flex flex-wrap items-center gap-3">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="relative overflow-hidden rounded-[10px] border border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-20 w-28 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  aria-label={`${t.removePhoto}: ${file.name}`}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-xs text-white hover:bg-ink"
                >
                  ✕
                </button>
              </div>
            ))}
            {files.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-20 w-28 items-center justify-center rounded-[10px] border border-dashed border-soft/50 text-center text-[12px] leading-tight text-soft transition-colors duration-300 hover:border-ink hover:text-ink"
              >
                + {t.addPhoto}
              </button>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[14px] text-[#9b3a2a]">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <button type="submit" disabled={sending} className="btn disabled:opacity-50">
            {sending ? t.sending : t.send}
          </button>
          <Link
            href="/configure"
            className="caps transition-colors duration-300 hover:text-ink"
          >
            {t.back}
          </Link>
        </div>
      </form>
    </main>
  );
}
