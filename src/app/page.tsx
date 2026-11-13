"use client";

import React, { useEffect, useState } from "react";
import {
  CategoryId,
  Language,
  Listing,
  ZilDatabase,
} from "@/lib/types";
import { playZilChime } from "@/lib/sound";
import { formatRemainingExpiry } from "@/lib/temperature";
import { ZilLogo } from "@/components/ZilLogo";
import { NeighborhoodMap } from "@/components/NeighborhoodMap";
import { GiveItemModal } from "@/components/GiveItemModal";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { TemperatureReviewModal } from "@/components/TemperatureReviewModal";
import { ApartmanPanosuTab } from "@/components/ApartmanPanosuTab";
import { ZilSesiChatTab } from "@/components/ZilSesiChatTab";
import { KomsuKartimTab } from "@/components/KomsuKartimTab";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import {
  Search,
  Bell,
  Volume2,
  VolumeX,
  Plus,
  ChevronDown,
  Clock,
  KeyRound,
  Home,
  FileText,
  MessageCircle,
  User,
  X,
  Globe,
} from "lucide-react";

type ActiveTab = "KAPI_ONU" | "APARTMAN_PANOSU" | "ZIL_SESI" | "KOMSU_KARTIM";

const CATEGORY_PILLS: {
  id: CategoryId;
  tr: string;
  en: string;
}[] = [
  { id: "ALL", tr: "Tümü", en: "All" },
  { id: "URGENT", tr: "⚡ Hemen Al", en: "⚡ Curb Alert" },
  { id: "HOME", tr: "Ev & Mobilya", en: "Home" },
  { id: "BABY_KIDS", tr: "Bebek & Çocuk", en: "Baby & Kids" },
  { id: "BOOKS_HOBBY", tr: "Kitap & Hobi", en: "Books" },
  { id: "PLANTS", tr: "Bitki", en: "Plants" },
  { id: "PETS", tr: "Evcil Hayvan", en: "Pets" },
];

export default function ZilMobileApp() {
  const [db, setDb] = useState<ZilDatabase | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("KAPI_ONU");
  const [lang, setLang] = useState<Language>("tr");
  const [muted, setMuted] = useState(false);

  // GPS Neighborhood & Radius Lock (Karrot '동네 범위 설정' Sheet)
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] =
    useState("nb-moda");
  const [radiusKm, setRadiusKm] = useState<0.5 | 1.5 | 3.0>(1.5);
  const [showScopeSheet, setShowScopeSheet] = useState(false);

  // Search & Filters
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("ALL");
  const [translatedCardIds, setTranslatedCardIds] = useState<
    Record<string, boolean>
  >({});

  // Full-Screen Mobile Push Views & Sheets
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );
  const [reviewListing, setReviewListing] = useState<Listing | null>(null);
  const [chatListingId, setChatListingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  useEffect(() => {
    fetch("/api/zil")
      .then((res) => res.json())
      .then((data: ZilDatabase) => setDb(data))
      .catch((err) => console.error("Failed to load ZiL state:", err));
  }, []);

  const mutateApi = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/zil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API Error");
    setDb(data as ZilDatabase);
    return data as ZilDatabase;
  };

  if (!db) {
    return (
      <div className="flex min-h-dvh justify-center bg-[#EFECE6]">
        <div className="flex w-full max-w-[430px] flex-col items-center justify-center bg-white">
          <ZilLogo size="md" />
          <p className="mt-2 text-xs font-medium text-stone">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const activeUser =
    db.users.find((u) => u.id === db.activeUserId) || db.users[0];
  const activeNeighborhood =
    db.neighborhoods.find((n) => n.id === selectedNeighborhoodId) ||
    db.neighborhoods[0];
  const selectedListing =
    db.listings.find((l) => l.id === selectedListingId) || null;

  const filteredListings = db.listings.filter((lst) => {
    const withinRadius = lst.distanceMeters <= radiusKm * 1000;
    const matchesCategory =
      selectedCategory === "ALL" || lst.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      lst.titleTr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lst.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lst.subAreaName.toLowerCase().includes(searchQuery.toLowerCase());
    return withinRadius && matchesCategory && matchesSearch;
  });

  const handleRingBell = async (listingId: string, note: string) => {
    playZilChime(muted);
    await mutateApi({ action: "RING_BELL", listingId, note });
    showToast(
      lang === "tr"
        ? "🔔 Ding-Dong! Komşunun ziline basıldı."
        : "🔔 Ding-Dong! Rang neighbor's bell."
    );
  };

  const handleReserveForNeighbor = async (
    listingId: string,
    requesterId: string
  ) => {
    playZilChime(muted);
    await mutateApi({
      action: "RESERVE_FOR_NEIGHBOR",
      listingId,
      requesterId,
    });
    showToast(
      lang === "tr"
        ? "🤝 Sözleşildi & ZİL güvenlik kodu üretildi"
        : "🤝 Reserved & ZİL security code generated"
    );
  };

  const handleCompleteHandoff = async (
    listingId: string,
    onTime: boolean,
    polite: boolean,
    easyPickup: boolean
  ) => {
    playZilChime(muted);
    await mutateApi({
      action: "COMPLETE_HANDOFF",
      listingId,
      onTime,
      polite,
      easyPickup,
    });
    setSelectedListingId(null);
    showToast(
      lang === "tr"
        ? "🎉 Paylaşım tamamlandı (+0.5°C)"
        : "🎉 Handoff completed (+0.5°C)"
    );
  };

  return (
    <div className="flex min-h-dvh justify-center bg-[#EFECE6]">
      {/* Strict Mobile Viewport Shell (430px max-width, native Karrot app feel) */}
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-white shadow-xl">
        {/* KARROT-STYLE MINIMALIST TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-13 items-center justify-between border-b border-[#F1EFEA] bg-white/95 px-4 backdrop-blur">
          {/* Left: Neighborhood Selector Trigger (e.g. "Caferağa 1.5km ▾") */}
          <button
            type="button"
            onClick={() => setShowScopeSheet(true)}
            className="flex items-center gap-1.5 text-left focus:outline-none active:opacity-70"
          >
            <span className="h-2 w-2 rounded-full bg-sage" />
            <span className="text-[17px] font-extrabold tracking-tight text-charcoal">
              {lang === "tr"
                ? activeNeighborhood.nameTr.split("&")[0].trim()
                : activeNeighborhood.nameEn.split("&")[0].trim()}
            </span>
            <span className="rounded bg-[#FAF8F5] px-1.5 py-0.5 text-[11px] font-bold text-bosporus border border-[#E5E7EB]">
              {radiusKm}km
            </span>
            <ChevronDown className="h-4 w-4 text-charcoal" />
          </button>

          {/* Right: Minimalist Action Icons */}
          <div className="flex items-center gap-1.5">
            {activeTab === "KAPI_ONU" && (
              <button
                type="button"
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal hover:bg-[#FAF8F5]"
                title="Ara / Search"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setLang(lang === "tr" ? "en" : "tr")}
              className="flex h-7 items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#FAF8F5] px-2 text-[11px] font-bold text-charcoal"
            >
              <Globe className="h-3 w-3 text-bosporus" />
              {lang.toUpperCase()}
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !muted;
                setMuted(next);
                if (!next) playZilChime(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal hover:bg-[#FAF8F5]"
              title="Ding-Dong Sesi"
            >
              {muted ? (
                <VolumeX className="h-4 w-4 text-stone" />
              ) : (
                <Volume2 className="h-4 w-4 text-amberbell" />
              )}
            </button>

            <ZilLogo
              size="sm"
              onClickBell={() => {
                playZilChime(muted);
                setShowOnboarding(true);
              }}
            />
          </div>
        </header>

        {/* Collapsible Minimal Search Input */}
        {showSearchBar && activeTab === "KAPI_ONU" && (
          <div className="border-b border-[#F1EFEA] bg-[#FAF8F5] px-4 py-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-stone" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === "tr"
                    ? "Mahallende ücretsiz eşya ara..."
                    : "Search free items in your mahalle..."
                }
                className="w-full rounded-xl bg-white pl-8 pr-8 py-1.5 text-xs text-charcoal border border-gray-200 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-stone"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* MAIN MOBILE VIEWPORT BODY */}
        <main className="flex-1 pb-20">
          {/* TAB 1: KAPI ÖNÜ (Karrot Minimalist List Feed) */}
          {activeTab === "KAPI_ONU" && (
            <div>
              {/* Ultra-Clean Horizontal Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#F1EFEA] px-4 py-2.5 no-scrollbar">
                {CATEGORY_PILLS.map((pill) => {
                  const active = selectedCategory === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setSelectedCategory(pill.id)}
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-bosporus text-white"
                          : "bg-[#FAF8F5] text-charcoal border border-[#E5E7EB]"
                      }`}
                    >
                      {lang === "tr" ? pill.tr : pill.en}
                    </button>
                  );
                })}
              </div>

              {/* Karrot Signature 106x106 Horizontal Row List Feed */}
              {filteredListings.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-semibold text-charcoal">
                    {lang === "tr"
                      ? `${radiusKm} km çevrede bu kategoride paylaşım yok.`
                      : `No giveaways within ${radiusKm} km in this category.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRadiusKm(3.0);
                      setSelectedCategory("ALL");
                      setSearchQuery("");
                    }}
                    className="mt-3 rounded-xl bg-bosporus px-4 py-2 text-xs font-bold text-white"
                  >
                    {lang === "tr"
                      ? "Mesafeyi 3.0 km Yap"
                      : "Expand to 3.0 km"}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#F1EFEA]">
                  {filteredListings.map((item) => {
                    const giver =
                      db.users.find((u) => u.id === item.giverId) || activeUser;
                    const ringCount = db.bellRings.filter(
                      (r) => r.listingId === item.id
                    ).length;
                    const isTranslated = !!translatedCardIds[item.id];
                    const showEnglish =
                      (lang === "en" && !isTranslated) ||
                      (lang === "tr" && isTranslated);
                    const expiryBadge = formatRemainingExpiry(
                      item.expiresAt,
                      lang
                    );
                    const photoCount = item.photoUrls?.length || 1;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedListingId(item.id)}
                        className="flex cursor-pointer gap-3.5 px-4 py-3.5 transition-colors hover:bg-[#FAF8F5]/60 active:bg-[#FAF8F5]"
                      >
                        {/* Left: Karrot 106x106 Rounded Square Thumbnail */}
                        <div className="relative h-[106px] w-[106px] shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gray-100">
                          <img
                            src={item.photoUrl}
                            alt={item.titleTr}
                            className="h-full w-full object-cover"
                          />
                          {photoCount > 1 && (
                            <span className="absolute right-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                              +{photoCount - 1}
                            </span>
                          )}
                          {expiryBadge && (
                            <span className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center gap-0.5 rounded-md bg-charcoal/85 py-0.5 text-[9px] font-bold text-amberbell backdrop-blur">
                              <Clock className="h-2.5 w-2.5" />
                              {expiryBadge}
                            </span>
                          )}
                        </div>

                        {/* Right: Minimalist Content Column */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            {/* Line 1: Clean Title + Subtle Translate Button */}
                            <div className="flex items-start justify-between gap-1.5">
                              <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-charcoal">
                                {showEnglish ? item.titleEn : item.titleTr}
                              </h3>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTranslatedCardIds((prev) => ({
                                    ...prev,
                                    [item.id]: !prev[item.id],
                                  }));
                                }}
                                className="shrink-0 rounded px-1 py-0.5 text-[10px] text-stone hover:bg-gray-100"
                                title="Çevir / Translate"
                              >
                                🌐
                              </button>
                            </div>

                            {/* Line 2: SubArea • Distance • Time */}
                            <p className="mt-1 text-xs text-stone">
                              {item.subAreaName.split("•")[0].trim()} •{" "}
                              {item.distanceMeters}m • {item.minutesAgo}
                              {lang === "tr" ? "dk" : "m"}
                            </p>

                            {/* Line 3: Karrot Status Badge + Free Label */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              {item.status === "RESERVED" && (
                                <span className="rounded bg-amberbell/25 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-900">
                                  {lang === "tr" ? "Sözleşildi" : "Reserved"}
                                </span>
                              )}
                              {item.status === "GIVEN" && (
                                <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-stone">
                                  {lang === "tr" ? "Verildi" : "Given"}
                                </span>
                              )}

                              <span className="text-[14px] font-extrabold text-bosporus">
                                {lang === "tr"
                                  ? "Ücretsiz Paylaşım"
                                  : "Free Gift"}
                              </span>

                              {item.securityPickupCode && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-teal-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-bosporus">
                                  <KeyRound className="h-2.5 w-2.5" />
                                  {item.securityPickupCode}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Bottom-Right: Karrot Minimalist Counters (🌡️ Temp & 🔔 Rings) */}
                          <div className="mt-1 flex items-center justify-end gap-2.5 text-xs text-stone">
                            <span className="text-[11px] font-medium">
                              🌡️ {giver.mannerTemp.toFixed(1)}°
                            </span>
                            {ringCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-charcoal">
                                <Bell className="h-3.5 w-3.5 text-amberbell fill-amberbell" />
                                {ringCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APARTMAN PANOSU (Karrot '동네생활' Feed) */}
          {activeTab === "APARTMAN_PANOSU" && (
            <ApartmanPanosuTab
              posts={db.boardPosts}
              users={db.users}
              activeUser={activeUser}
              radiusKm={radiusKm}
              lang={lang}
              onCreatePost={async (payload) => {
                await mutateApi({
                  action: "CREATE_BOARD_POST",
                  ...payload,
                });
                showToast(
                  lang === "tr" ? "📌 Panoda paylaşıldı" : "📌 Posted to board"
                );
              }}
              onReplyPost={async (postId, text) => {
                await mutateApi({
                  action: "REPLY_BOARD_POST",
                  postId,
                  text,
                });
              }}
            />
          )}

          {/* TAB 3: ZİL SESİ (Karrot Mobile Chat Inbox -> Thread) */}
          {activeTab === "ZIL_SESI" && (
            <ZilSesiChatTab
              listings={db.listings}
              messages={db.chatMessages}
              users={db.users}
              activeUser={activeUser}
              neighborhood={activeNeighborhood}
              selectedListingId={chatListingId}
              onSelectListingId={(id) => setChatListingId(id)}
              lang={lang}
              onSendMessage={async (payload) => {
                await mutateApi({
                  action: "SEND_CHAT_MESSAGE",
                  ...payload,
                });
              }}
              onReserveForNeighbor={handleReserveForNeighbor}
              onOpenHandoffReview={(lst) => setReviewListing(lst)}
              onReportViolation={async (
                listingId,
                reportedUserId,
                reasonType
              ) => {
                await mutateApi({
                  action: "REPORT_VIOLATION",
                  listingId,
                  reportedUserId,
                  reasonType,
                });
                showToast(
                  lang === "tr"
                    ? `⚠️ İhlal bildirildi (${
                        reasonType === "NO_SHOW" ? "-1.5°C" : "-2.0°C"
                      })`
                    : `⚠️ Violation reported (${
                        reasonType === "NO_SHOW" ? "-1.5°C" : "-2.0°C"
                      })`
                );
              }}
              onBlockUser={async (blockedUserId) => {
                await mutateApi({
                  action: "BLOCK_USER",
                  blockedUserId,
                });
                showToast(
                  lang === "tr"
                    ? "🚫 Komşu engellendi ve içerikleri gizlendi"
                    : "🚫 Neighbor blocked and content hidden"
                );
              }}
            />
          )}

          {/* TAB 4: KOMŞU KARTIM (Karrot '나의 당근' Profile) */}
          {activeTab === "KOMSU_KARTIM" && (
            <KomsuKartimTab
              activeUser={activeUser}
              users={db.users}
              neighborhood={activeNeighborhood}
              lang={lang}
              onSwitchUser={async (userId) => {
                await mutateApi({ action: "SWITCH_USER", userId });
                showToast(
                  lang === "tr"
                    ? "👤 Komşu profili değiştirildi"
                    : "👤 Switched neighbor profile"
                );
              }}
              onVerifyGps={async () => {
                await mutateApi({
                  action: "VERIFY_GPS",
                  neighborhoodId: selectedNeighborhoodId,
                });
                showToast(
                  lang === "tr"
                    ? "📍 Mahalle GPS doğrulandı"
                    : "📍 Mahalle GPS verified"
                );
              }}
              onResetDemo={async () => {
                await mutateApi({ action: "RESET_DEMO" });
                showToast(
                  lang === "tr" ? "🔄 Veriler sıfırlandı" : "🔄 Demo reset"
                );
              }}
              onOpenOnboarding={() => setShowOnboarding(true)}
              onToggleSocialProvider={async (provider) => {
                await mutateApi({
                  action: "TOGGLE_SOCIAL_PROVIDER",
                  provider,
                });
                showToast(
                  lang === "tr"
                    ? `🔗 ${provider.toUpperCase()} hesap durumu güncellendi`
                    : `🔗 Updated ${provider.toUpperCase()} link status`
                );
              }}
              onDeleteAccount={async () => {
                await mutateApi({ action: "DELETE_ACCOUNT" });
                showToast(
                  lang === "tr"
                    ? "🗑️ Hesap ve veriler kalıcı olarak silindi"
                    : "🗑️ Account and data permanently deleted"
                );
              }}
            />
          )}
        </main>

        {/* Karrot Floating "+ Hediye Ver" Pill Button (Inside 430px Mobile Frame) */}
        {activeTab === "KAPI_ONU" && (
          <div className="pointer-events-none fixed bottom-18 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowGiveModal(true)}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-amberbell px-4 py-3 text-xs font-extrabold text-charcoal shadow-lg active:scale-95 transition-transform"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>{lang === "tr" ? "Hediye Ver" : "Give Free"}</span>
            </button>
          </div>
        )}

        {/* Toast Notification inside Mobile Viewport */}
        {toastMessage && (
          <div className="fixed bottom-18 left-1/2 z-50 -translate-x-1/2 rounded-full bg-charcoal/95 px-4 py-2 text-xs font-semibold text-white shadow-lg">
            {toastMessage}
          </div>
        )}

        {/* KARROT-STYLE MINIMALIST BOTTOM TAB BAR (Fixed to 430px Shell) */}
        <nav className="fixed bottom-0 left-1/2 z-30 flex h-14 w-full max-w-[430px] -translate-x-1/2 items-center justify-around border-t border-[#F1EFEA] bg-white">
          {[
            {
              id: "KAPI_ONU" as const,
              icon: Home,
              tr: "Kapı Önü",
              en: "Home",
            },
            {
              id: "APARTMAN_PANOSU" as const,
              icon: FileText,
              tr: "Mahallem",
              en: "Board",
            },
            {
              id: "ZIL_SESI" as const,
              icon: MessageCircle,
              tr: "Zil Sesi",
              en: "Chats",
              dot: db.chatMessages.length > 0,
            },
            {
              id: "KOMSU_KARTIM" as const,
              icon: User,
              tr: "Komşu Kartım",
              en: "My Zil",
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
                  active ? "text-charcoal font-bold" : "text-stone font-medium"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`h-5 w-5 ${
                      active ? "stroke-[2.4] text-bosporus" : "stroke-[1.7]"
                    }`}
                  />
                  {tab.dot && (
                    <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-amberbell" />
                  )}
                </div>
                <span className="mt-1 text-[10px] leading-none">
                  {lang === "tr" ? tab.tr : tab.en}
                </span>
              </button>
            );
          })}
        </nav>

        {/* KARROT '동네 범위 설정' (Neighborhood & GPS Range) Bottom Sheet */}
        {showScopeSheet && (
          <div className="fixed inset-0 z-50 flex justify-center items-end bg-black/40">
            <div className="w-full max-w-[430px] rounded-t-3xl bg-white p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-charcoal">
                    {lang === "tr"
                      ? "Mahallem & Mesafe Ayarı"
                      : "My Neighborhood & Range"}
                  </h3>
                  <p className="text-xs text-stone">
                    {lang === "tr"
                      ? "Yalnızca seçtiğin yakınlıktaki komşu ilanlarını görürsün"
                      : "Only see free gifts within your chosen local radius"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScopeSheet(false)}
                  className="p-1 text-stone"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Neighborhood Selector Pills */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {db.neighborhoods.map((nb) => {
                  const active = nb.id === selectedNeighborhoodId;
                  return (
                    <button
                      key={nb.id}
                      type="button"
                      onClick={() => setSelectedNeighborhoodId(nb.id)}
                      className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                        active
                          ? "border-bosporus bg-bosporus text-white"
                          : "border-gray-200 text-charcoal"
                      }`}
                    >
                      📍 {lang === "tr" ? nb.nameTr : nb.nameEn}
                    </button>
                  );
                })}
              </div>

              {/* Interactive Radius Map Preview */}
              <NeighborhoodMap
                neighborhood={activeNeighborhood}
                listings={filteredListings}
                radiusKm={radiusKm}
                onSelectListing={(lst) => {
                  setShowScopeSheet(false);
                  setSelectedListingId(lst.id);
                }}
                lang={lang}
                compact
              />

              {/* Karrot 3-Step Slider Track (0.5km — 1.5km — 3.0km) */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      {
                        km: 0.5 as const,
                        tr: "Sitem (0.5 km)",
                        en: "My Street (0.5 km)",
                      },
                      {
                        km: 1.5 as const,
                        tr: "Mahallem (1.5 km)",
                        en: "Mahalle (1.5 km)",
                      },
                      {
                        km: 3.0 as const,
                        tr: "Yakın Çevre (3 km)",
                        en: "Nearby (3 km)",
                      },
                    ] as const
                  ).map((step) => (
                    <button
                      key={step.km}
                      type="button"
                      onClick={() => setRadiusKm(step.km)}
                      className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                        radiusKm === step.km
                          ? "border-bosporus bg-teal-50 text-bosporus"
                          : "border-gray-200 text-stone"
                      }`}
                    >
                      {lang === "tr" ? step.tr : step.en}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowScopeSheet(false)}
                className="w-full rounded-xl bg-bosporus py-3 text-xs font-extrabold text-white"
              >
                {lang === "tr" ? "Uygula" : "Apply"}
              </button>
            </div>
          </div>
        )}

        {/* Full-Screen Modals inside 430px Mobile Frame */}
        <OnboardingFlow
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          neighborhoods={db.neighborhoods}
          lang={lang}
          onChangeLang={setLang}
          onCompleteOnboarding={async (payload) => {
            playZilChime(muted);
            setSelectedNeighborhoodId(payload.neighborhoodId);
            await mutateApi({
              action: "COMPLETE_ONBOARDING",
              ...payload,
            });
            showToast(
              lang === "tr"
                ? `🔔 Hoş geldin ${payload.displayName}! 36.5°C ile başladın.`
                : `🔔 Welcome ${payload.displayName}! Started at 36.5°C.`
            );
          }}
        />

        <GiveItemModal
          isOpen={showGiveModal}
          onClose={() => setShowGiveModal(false)}
          neighborhood={activeNeighborhood}
          lang={lang}
          onSubmitListing={async (payload) => {
            try {
              playZilChime(muted);
              await mutateApi({ action: "CREATE_LISTING", ...payload });
              showToast(
                lang === "tr"
                  ? "🎁 Hediyen mahallede paylaşıldı"
                  : "🎁 Shared with your mahalle"
              );
              return null;
            } catch (err) {
              return err instanceof Error ? err.message : "Error";
            }
          }}
        />

        <ItemDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListingId(null)}
          activeUser={activeUser}
          users={db.users}
          neighborhood={activeNeighborhood}
          bellRings={db.bellRings}
          lang={lang}
          onRingBell={handleRingBell}
          onReserveForNeighbor={handleReserveForNeighbor}
          onOpenHandoffReview={(lst) => setReviewListing(lst)}
          onOpenChatForListing={(lstId) => {
            setChatListingId(lstId);
            setActiveTab("ZIL_SESI");
          }}
        />

        <TemperatureReviewModal
          listing={reviewListing}
          onClose={() => setReviewListing(null)}
          lang={lang}
          onConfirmHandoff={handleCompleteHandoff}
        />
      </div>
    </div>
  );
}
