"use client";

import React, { useState } from "react";
import {
  BellRingRequest,
  Language,
  Listing,
  Neighborhood,
  NeighborUser,
} from "@/lib/types";
import {
  formatRemainingExpiry,
  getTemperatureTier,
} from "@/lib/temperature";
import { NeighborhoodMap } from "./NeighborhoodMap";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Heart,
  Bell,
  KeyRound,
  Clock,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  MapPin,
} from "lucide-react";

interface ItemDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  activeUser: NeighborUser;
  users: NeighborUser[];
  neighborhood: Neighborhood;
  bellRings: BellRingRequest[];
  lang: Language;
  onRingBell: (listingId: string, note: string) => Promise<void>;
  onReserveForNeighbor: (
    listingId: string,
    requesterId: string
  ) => Promise<void>;
  onOpenHandoffReview: (listing: Listing) => void;
  onOpenChatForListing: (listingId: string) => void;
}

const ICEBREAKERS = [
  {
    tr: "Merhaba komşu! Hala müsaitse bugün gelip alabilirim.",
    en: "Hi neighbor! If still available, I can pick it up today.",
  },
  {
    tr: "Merhaba! Ne zaman ve nereden teslim almak sizin için uygun olur?",
    en: "Hi! When and where works best for pickup?",
  },
  {
    tr: "Yeni taşındık, evimiz için çok seviniriz! Güvenlikten teslim alabilirim.",
    en: "We just moved in, would love this! Can pick up from security.",
  },
];

export function ItemDetailModal({
  listing,
  onClose,
  activeUser,
  users,
  neighborhood,
  bellRings,
  lang,
  onRingBell,
  onReserveForNeighbor,
  onOpenHandoffReview,
  onOpenChatForListing,
}: ItemDetailModalProps) {
  const [translated, setTranslated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showIcebreakerSheet, setShowIcebreakerSheet] = useState(false);
  const [customNote, setCustomNote] = useState(
    lang === "tr" ? ICEBREAKERS[0].tr : ICEBREAKERS[0].en
  );
  const [submittingRing, setSubmittingRing] = useState(false);

  if (!listing) return null;

  const photos =
    listing.photoUrls && listing.photoUrls.length > 0
      ? listing.photoUrls
      : [listing.photoUrl];
  const safePhotoIndex = photoIndex >= photos.length ? 0 : photoIndex;

  const giver =
    users.find((u) => u.id === listing.giverId) || activeUser;
  const giverTier = getTemperatureTier(giver.mannerTemp);
  const tempPercent = Math.min(
    100,
    Math.max(12, ((giver.mannerTemp - 30) / 35) * 100)
  );

  const listingRings = bellRings.filter((r) => r.listingId === listing.id);
  const myRing = listingRings.find((r) => r.requesterId === activeUser.id);
  const reservedUser = users.find((u) => u.id === listing.reservedForUserId);
  const expiryText = formatRemainingExpiry(listing.expiresAt, lang);

  const showEnglish =
    (lang === "en" && !translated) || (lang === "tr" && translated);
  const displayTitle = showEnglish ? listing.titleEn : listing.titleTr;
  const displayDesc = showEnglish
    ? listing.descriptionEn
    : listing.descriptionTr;

  const handleConfirmRing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNote.trim()) return;
    setSubmittingRing(true);
    await onRingBell(listing.id, customNote.trim());
    setSubmittingRing(false);
    setShowIcebreakerSheet(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/40">
      {/* Native Mobile Screen Container (430px max width) */}
      <div className="relative flex h-dvh w-full max-w-[430px] flex-col bg-white shadow-2xl overflow-hidden">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Karrot-Style Square Multi-Photo Carousel */}
          <div className="relative aspect-square w-full bg-gray-100">
            <img
              src={photos[safePhotoIndex]}
              alt={displayTitle}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent" />

            {/* Floating Mobile Top Bar */}
            <div className="absolute inset-x-3 top-3 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm backdrop-blur active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setTranslated(!translated)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur ${
                  translated
                    ? "bg-bosporus text-white"
                    : "bg-white/90 text-charcoal"
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-bosporus" />
                {translated
                  ? lang === "tr"
                    ? "Orijinal"
                    : "Original"
                  : lang === "tr"
                  ? "Çevir"
                  : "Translate"}
              </button>
            </div>

            {/* Carousel Left/Right Controls if multiple photos */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoIndex(
                      (safePhotoIndex - 1 + photos.length) % photos.length
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoIndex((safePhotoIndex + 1) % photos.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Bottom Dots + Counter */}
                <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                  {safePhotoIndex + 1} / {photos.length}
                </div>
              </>
            )}

            {/* Urgent Curb Alert Countdown if present */}
            {expiryText && (
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-charcoal/85 px-3 py-1 text-[11px] font-bold text-amberbell backdrop-blur">
                <Clock className="h-3 w-3" />
                {expiryText}
              </div>
            )}
          </div>

          {/* Karrot Signature Giver Profile & Manner Temperature Row */}
          <div className="flex items-center justify-between border-b border-[#F1EFEA] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold ${giver.avatarColor}`}
              >
                {giver.initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold text-charcoal">
                    {giver.displayName}
                  </span>
                  <span className="rounded bg-[#FAF8F5] px-1.5 py-0.5 text-[10px] font-semibold text-stone">
                    {lang === "tr"
                      ? `Verdiği: ${giver.itemsGivenCount}`
                      : `Given: ${giver.itemsGivenCount}`}
                  </span>
                </div>
                <p className="text-xs text-stone">{listing.subAreaName}</p>
              </div>
            </div>

            {/* Right: Karrot Manner Temperature Widget */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span
                  className={`text-sm font-extrabold ${giverTier.badgeText}`}
                >
                  {giver.mannerTemp.toFixed(1)}°C
                </span>
                <span className="text-base leading-none">{giverTier.icon}</span>
              </div>
              <div className="mt-1 h-1.5 w-14 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full ${giverTier.barColor}`}
                  style={{ width: `${tempPercent}%` }}
                />
              </div>
              <span className="mt-0.5 text-[10px] text-stone underline decoration-dotted">
                {lang === "tr" ? "Komşuluk Derecesi" : "Manner Temp"}
              </span>
            </div>
          </div>

          {/* Main Item Text Section */}
          <div className="px-4 py-4 space-y-3">
            {/* Status + Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {listing.status === "RESERVED" && (
                  <span className="rounded bg-amberbell/20 px-2 py-0.5 text-xs font-extrabold text-amber-900">
                    {lang === "tr" ? "Sözleşildi" : "Reserved"}
                  </span>
                )}
                {listing.status === "GIVEN" && (
                  <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-bold text-stone">
                    {lang === "tr" ? "Verildi" : "Given"}
                  </span>
                )}
                <h1 className="text-[18px] font-bold text-charcoal leading-snug">
                  {displayTitle}
                </h1>
              </div>

              <p className="text-xs text-stone">
                {listing.pickupType === "SITE_SECURITY"
                  ? lang === "tr"
                    ? "🏢 Site Güvenliğinden Teslim"
                    : "🏢 Security Desk Pickup"
                  : listing.pickupType === "SAFE_SPOT"
                  ? lang === "tr"
                    ? "☕ Güvenli Nokta"
                    : "☕ Safe Public Spot"
                  : lang === "tr"
                  ? "🚪 Kapı Önü"
                  : "🚪 Doorstep"}{" "}
                • {listing.distanceMeters}m • {listing.minutesAgo}{" "}
                {lang === "tr" ? "dk önce" : "m ago"}
              </p>
            </div>

            {/* Body Description */}
            <p className="text-[15px] leading-relaxed text-charcoal/90 whitespace-pre-line">
              {displayDesc}
            </p>

            {/* Site Security Code Pass ('ZİL-XXXX') when Reserved */}
            {listing.securityPickupCode && (
              <div className="rounded-2xl border border-bosporus/25 bg-[#FAF8F5] p-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-bosporus">
                    <KeyRound className="h-4 w-4 text-amberbell" />
                    {lang === "tr"
                      ? "Site Güvenliği Teslim Kodu"
                      : "Security Desk Pickup Code"}
                  </span>
                  <span className="rounded-lg bg-bosporus px-2.5 py-1 font-mono text-xs font-black tracking-wider text-white">
                    {listing.securityPickupCode}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-stone">
                  {lang === "tr"
                    ? `${listing.safeSpotName} danışmasına "${listing.securityPickupCode} (${
                        reservedUser?.displayName || "Komşu"
                      })" kodunu söyleyerek numara paylaşmadan teslim alabilirsiniz.`
                    : `Quote "${listing.securityPickupCode}" at ${listing.safeSpotName} security desk without sharing phone numbers.`}
                </p>
              </div>
            )}

            {/* Safe Meetup Location Section */}
            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal">
                  {lang === "tr"
                    ? "Teslim Noktası (250m Bulanık Konum)"
                    : "Pickup Spot (250m Fuzzy Circle)"}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-bosporus">
                  <MapPin className="h-3.5 w-3.5" />
                  {listing.safeSpotName}
                </span>
              </div>
              <NeighborhoodMap
                neighborhood={neighborhood}
                listings={[listing]}
                radiusKm={1.5}
                selectedListing={listing}
                lang={lang}
                compact
              />
            </div>

            {/* Minimalist Fair Share Queue ("Zile Basan Komşular") */}
            <div className="border-t border-[#F1EFEA] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal">
                  🔔{" "}
                  {lang === "tr"
                    ? `Zile Basan Komşular (${listingRings.length})`
                    : `Neighbors Who Rang (${listingRings.length})`}
                </span>
                <span className="text-[11px] text-stone">
                  {lang === "tr"
                    ? "Adil Paylaşım Sırası"
                    : "Fair Share Queue"}
                </span>
              </div>

              {listingRings.length === 0 ? (
                <p className="mt-2 text-xs text-stone">
                  {lang === "tr"
                    ? "Henüz zile basan olmadı. İlk sen zile bas!"
                    : "No one has rung yet. Be the first!"}
                </p>
              ) : (
                <div className="mt-2.5 divide-y divide-[#F1EFEA] rounded-2xl border border-[#F1EFEA] bg-[#FAF8F5]/60">
                  {listingRings.map((ring) => {
                    const reqUser =
                      users.find((u) => u.id === ring.requesterId) ||
                      activeUser;
                    const isSelected =
                      listing.reservedForUserId === reqUser.id ||
                      ring.status === "SELECTED";

                    return (
                      <div key={ring.id} className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${reqUser.avatarColor}`}
                            >
                              {reqUser.initials}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-charcoal">
                                  {reqUser.displayName}
                                </span>
                                <span className="text-[11px] font-bold text-bosporus">
                                  {reqUser.mannerTemp.toFixed(1)}°C
                                </span>
                              </div>
                              <span className="block text-[10px] text-stone">
                                {lang === "tr"
                                  ? `Verdiği: ${reqUser.itemsGivenCount} • Aldığı: ${reqUser.itemsReceivedCount}`
                                  : `Given: ${reqUser.itemsGivenCount} • Received: ${reqUser.itemsReceivedCount}`}
                              </span>
                            </div>
                          </div>

                          {listing.status !== "GIVEN" && (
                            <div>
                              {!isSelected ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onReserveForNeighbor(
                                      listing.id,
                                      reqUser.id
                                    )
                                  }
                                  className="rounded-lg bg-bosporus px-2.5 py-1 text-[11px] font-bold text-white"
                                >
                                  {lang === "tr" ? "Sözleş" : "Reserve"}
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-amberbell/25 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {lang === "tr" ? "Sözleşildi" : "Reserved"}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-charcoal/85">
                          &ldquo;{showEnglish ? ring.noteEn : ring.noteTr}&rdquo;
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick Handoff Completion Bar */}
              {listing.status !== "GIVEN" && listingRings.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChatForListing(listing.id);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-bold text-charcoal"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-bosporus" />
                    {lang === "tr" ? "Sohbeti Aç" : "Open Chat"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenHandoffReview(listing)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-sage py-2 text-xs font-bold text-white"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {lang === "tr" ? "Teslim Edildi" : "Mark Given"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Polite Icebreaker Bottom Sheet inside Mobile Frame */}
        {showIcebreakerSheet && (
          <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40">
            <form
              onSubmit={handleConfirmRing}
              className="rounded-t-3xl bg-white p-5 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-charcoal">
                  {lang === "tr"
                    ? "🔔 Komşuna Not Bırakarak Zile Bas"
                    : "🔔 Ring Bell with a Polite Note"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowIcebreakerSheet(false)}
                  className="text-xs font-semibold text-stone"
                >
                  {lang === "tr" ? "Kapat" : "Close"}
                </button>
              </div>

              <div className="space-y-1.5">
                {ICEBREAKERS.map((ice, idx) => {
                  const text = lang === "tr" ? ice.tr : ice.en;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomNote(text)}
                      className={`w-full rounded-xl border p-2.5 text-left text-xs transition-all ${
                        customNote === text
                          ? "border-bosporus bg-teal-50/60 font-bold text-bosporus"
                          : "border-gray-200 text-charcoal"
                      }`}
                    >
                      {text}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs text-charcoal focus:border-bosporus focus:outline-none"
              />

              <button
                type="submit"
                disabled={submittingRing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amberbell py-3 text-sm font-extrabold text-charcoal"
              >
                <Bell className="h-4 w-4" />
                {submittingRing
                  ? "..."
                  : lang === "tr"
                  ? "Ding-Dong! Zili Çal"
                  : "Ding-Dong! Ring Bell"}
              </button>
            </form>
          </div>
        )}

        {/* Karrot-Style Sticky Bottom Bar */}
        <div className="flex h-16 items-center justify-between border-t border-[#F1EFEA] bg-white px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSaved(!saved)}
              className={`p-1.5 transition-colors ${
                saved ? "text-terracotta" : "text-stone hover:text-charcoal"
              }`}
            >
              <Heart className={`h-6 w-6 ${saved ? "fill-current" : ""}`} />
            </button>
            <div className="h-7 w-[1px] bg-gray-200" />
            <div>
              <span className="block text-sm font-extrabold text-bosporus">
                {lang === "tr" ? "Ücretsiz Paylaşım" : "Free Gift"}
              </span>
              <span className="block text-[11px] text-stone">
                🔔 {listingRings.length}{" "}
                {lang === "tr" ? "komşu ilgileniyor" : "neighbors rang"}
              </span>
            </div>
          </div>

          {myRing ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChatForListing(listing.id);
              }}
              className="rounded-xl bg-bosporus px-5 py-2.5 text-xs font-extrabold text-white"
            >
              {lang === "tr" ? "Sohbeti Aç" : "Open Chat"}
            </button>
          ) : (
            <button
              type="button"
              disabled={listing.status === "GIVEN"}
              onClick={() => setShowIcebreakerSheet(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amberbell px-5 py-2.5 text-sm font-extrabold text-charcoal shadow-2xs active:scale-95 transition-transform disabled:opacity-40"
            >
              <Bell className="h-4 w-4" />
              {lang === "tr" ? "Zile Bas" : "Ring Bell"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
