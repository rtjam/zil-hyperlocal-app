"use client";

import React, { useState } from "react";
import { Language, Listing } from "@/lib/types";
import { X, Sparkles, Check } from "lucide-react";

interface TemperatureReviewModalProps {
  listing: Listing | null;
  onClose: () => void;
  lang: Language;
  onConfirmHandoff: (
    listingId: string,
    onTime: boolean,
    polite: boolean,
    easyPickup: boolean
  ) => Promise<void>;
}

export function TemperatureReviewModal({
  listing,
  onClose,
  lang,
  onConfirmHandoff,
}: TemperatureReviewModalProps) {
  const [onTime, setOnTime] = useState(true);
  const [polite, setPolite] = useState(true);
  const [easyPickup, setEasyPickup] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!listing) return null;

  const tapCount =
    (onTime ? 1 : 0) + (polite ? 1 : 0) + (easyPickup ? 1 : 0);
  const receiverBonus =
    tapCount === 3 ? "+0.4°C" : tapCount === 2 ? "+0.3°C" : "+0.2°C";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onConfirmHandoff(listing.id, onTime, polite, easyPickup);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end bg-black/40">
      <div className="w-full max-w-[430px] rounded-t-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-bosporus">
            🌡️ {lang === "tr" ? "Komşuluk Değerlendirmesi" : "Neighbor Feedback"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mt-1.5 text-base font-bold text-charcoal">
          {lang === "tr"
            ? "Paylaşım nasıl geçti?"
            : "How was the handoff?"}
        </h3>
        <p className="text-xs text-stone truncate">
          {lang === "tr" ? listing.titleTr : listing.titleEn}
        </p>

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-2">
          {[
            {
              checked: onTime,
              toggle: () => setOnTime(!onTime),
              tr: "⏰ Sözleşilen saatte vaktinde geldi",
              en: "⏰ Arrived right on time",
            },
            {
              checked: polite,
              toggle: () => setPolite(!polite),
              tr: "🤝 İletişimi kibar ve komşuluk ruhuna uygundu",
              en: "🤝 Polite and warm neighborly communication",
            },
            {
              checked: easyPickup,
              toggle: () => setEasyPickup(!easyPickup),
              tr: "📍 Teslimat noktasına kolayca ulaştı",
              en: "📍 Smooth pickup at the safe spot",
            },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={item.toggle}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                item.checked
                  ? "border-bosporus bg-teal-50/50 text-charcoal"
                  : "border-gray-200 text-stone"
              }`}
            >
              <span className="text-xs font-semibold">
                {lang === "tr" ? item.tr : item.en}
              </span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  item.checked
                    ? "bg-bosporus text-white"
                    : "border border-gray-300"
                }`}
              >
                {item.checked && <Check className="h-3 w-3" />}
              </span>
            </button>
          ))}

          <div className="flex items-center justify-between rounded-xl bg-[#FAF8F5] px-3 py-2 text-xs">
            <span className="text-stone">
              {lang === "tr" ? "Sıcaklık Artışı:" : "Temp Boost:"}
            </span>
            <span className="font-bold text-bosporus">
              +0.5°C ({lang === "tr" ? "Veren" : "Giver"}) / {receiverBonus} (
              {lang === "tr" ? "Alan" : "Receiver"})
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amberbell py-3 text-sm font-extrabold text-charcoal"
          >
            <Sparkles className="h-4 w-4" />
            {submitting
              ? "..."
              : lang === "tr"
              ? "Paylaşımı Tamamla"
              : "Complete Handoff"}
          </button>
        </form>
      </div>
    </div>
  );
}
