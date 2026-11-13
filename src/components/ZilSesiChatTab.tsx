"use client";

import React, { useState } from "react";
import {
  ChatMessage,
  Language,
  Listing,
  Neighborhood,
  NeighborUser,
} from "@/lib/types";
import {
  MapPin,
  Clock,
  Handshake,
  Sparkles,
  Send,
  Globe,
  ChevronLeft,
  KeyRound,
  Flag,
} from "lucide-react";

interface ZilSesiChatTabProps {
  listings: Listing[];
  messages: ChatMessage[];
  users: NeighborUser[];
  activeUser: NeighborUser;
  neighborhood: Neighborhood;
  selectedListingId: string | null;
  onSelectListingId: (id: string | null) => void;
  lang: Language;
  onSendMessage: (payload: {
    listingId: string;
    receiverId: string;
    messageType?:
      | "TEXT"
      | "SAFE_SPOT_PIN"
      | "PICKUP_TIME"
      | "SECURITY_CODE"
      | "SYSTEM";
    textTr: string;
    textEn: string;
    safeSpotName?: string;
    pickupTime?: string;
  }) => Promise<void>;
  onReserveForNeighbor: (
    listingId: string,
    requesterId: string
  ) => Promise<void>;
  onOpenHandoffReview: (listing: Listing) => void;
  onReportViolation: (
    listingId: string,
    reportedUserId: string,
    reasonType: "NO_SHOW" | "ASKED_MONEY_OR_RUDE"
  ) => Promise<void>;
  onBlockUser: (blockedUserId: string) => Promise<void>;
}

export function ZilSesiChatTab({
  listings,
  messages,
  users,
  activeUser,
  neighborhood,
  selectedListingId,
  onSelectListingId,
  lang,
  onSendMessage,
  onReserveForNeighbor,
  onOpenHandoffReview,
  onReportViolation,
  onBlockUser,
}: ZilSesiChatTabProps) {
  const [textInput, setTextInput] = useState("");
  const [translateAll, setTranslateAll] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  const activeListings = listings.filter((l) =>
    messages.some((m) => m.listingId === l.id)
  );

  const currentListing = activeListings.find(
    (l) => l.id === selectedListingId
  );

  // STEP 1: Karrot Mobile Chat Inbox List when no thread is open
  if (!currentListing) {
    return (
      <div className="divide-y divide-[#F1EFEA]">
        {activeListings.map((lst) => {
          const threadMsgs = messages.filter((m) => m.listingId === lst.id);
          const lastMsg = threadMsgs[threadMsgs.length - 1];
          const otherUserId =
            lst.giverId === activeUser.id
              ? threadMsgs.find((m) => m.senderId !== activeUser.id)
                  ?.senderId || "user-alexey"
              : lst.giverId;
          const otherUser =
            users.find((u) => u.id === otherUserId) || users[0];

          return (
            <button
              key={lst.id}
              type="button"
              onClick={() => onSelectListingId(lst.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-[#FAF8F5] transition-colors"
            >
              {/* Left: Avatar + Name + Last Message */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${otherUser.avatarColor}`}
                >
                  {otherUser.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-charcoal">
                      {otherUser.displayName}
                    </span>
                    <span className="text-[11px] font-semibold text-bosporus">
                      {otherUser.mannerTemp.toFixed(1)}°C
                    </span>
                    <span className="text-[11px] text-stone">
                      • {lastMsg?.createdAt || "Şimdi"}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-stone">
                    {lastMsg
                      ? lang === "tr"
                        ? lastMsg.textTr
                        : lastMsg.textEn
                      : lst.titleTr}
                  </p>
                </div>
              </div>

              {/* Right: Karrot 44x44 Item Thumbnail */}
              <img
                src={lst.photoUrl}
                alt={lst.titleTr}
                className="h-11 w-11 shrink-0 rounded-lg object-cover border border-gray-200"
              />
            </button>
          );
        })}
      </div>
    );
  }

  // STEP 2: Full-Screen Mobile Chat Room
  const threadMessages = messages.filter(
    (m) => m.listingId === currentListing.id
  );
  const counterpartId =
    currentListing.giverId === activeUser.id
      ? threadMessages.find((m) => m.senderId !== activeUser.id)?.senderId ||
        currentListing.reservedForUserId ||
        "user-alexey"
      : currentListing.giverId;

  const counterpart =
    users.find((u) => u.id === counterpartId) || users[0];

  const showEnglish =
    (lang === "en" && !translateAll) || (lang === "tr" && translateAll);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const val = textInput.trim();
    setTextInput("");
    await onSendMessage({
      listingId: currentListing.id,
      receiverId: counterpart.id,
      messageType: "TEXT",
      textTr: val,
      textEn: val,
    });
  };

  return (
    <div className="relative flex flex-col h-[calc(100dvh-114px)] bg-white">
      {/* Top Sub-Header with Back Button, Neighbor Name & Report Icon */}
      <div className="flex items-center justify-between border-b border-[#F1EFEA] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectListingId(null)}
            className="p-1 text-charcoal"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-charcoal">
                {counterpart.displayName}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  counterpart.mannerTemp < 34.0
                    ? "bg-red-100 text-terracotta"
                    : "bg-teal-50 text-bosporus"
                }`}
              >
                {counterpart.mannerTemp.toFixed(1)}°C
              </span>
            </div>
            <span className="block text-[10px] text-stone">
              {lang === "tr"
                ? "Genellikle 10 dk içinde yanıtlar"
                : "Usually replies within 10 mins"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTranslateAll(!translateAll)}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              translateAll
                ? "border-bosporus bg-bosporus text-white"
                : "border-gray-200 text-charcoal"
            }`}
          >
            <Globe className="h-3 w-3" />
            {translateAll
              ? lang === "tr"
                ? "TR"
                : "EN"
              : lang === "tr"
              ? "Çevir"
              : "Translate"}
          </button>

          <button
            type="button"
            onClick={() => setShowReportMenu(!showReportMenu)}
            title={lang === "tr" ? "Bildir / Uyarı" : "Report / Penalty"}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-red-50 text-terracotta"
          >
            <Flag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Trust & Safety Moderation Sheet (Section 3.3 Temperature Penalties) */}
      {showReportMenu && (
        <div className="border-b border-red-200 bg-red-50/90 px-4 py-3 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-terracotta">
            <span>
              🚩{" "}
              {lang === "tr"
                ? "Güvenlik & Komşuluk İhlali Bildir"
                : "Report Trust & Safety Violation"}
            </span>
            <button
              type="button"
              onClick={() => setShowReportMenu(false)}
              className="text-[11px] text-stone"
            >
              {lang === "tr" ? "Kapat" : "Close"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={async () => {
                await onReportViolation(
                  currentListing.id,
                  counterpart.id,
                  "NO_SHOW"
                );
                setShowReportMenu(false);
              }}
              className="flex items-center justify-between rounded-xl border border-red-200 bg-white px-3 py-2 text-left font-semibold text-charcoal hover:bg-red-50"
            >
              <span>
                {lang === "tr"
                  ? "⏰ Sözleşilen buluşmaya gelmedi (No-Show)"
                  : "⏰ Missed scheduled meetup (Confirmed No-Show)"}
              </span>
              <span className="font-extrabold text-terracotta">-1.5°C</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await onReportViolation(
                  currentListing.id,
                  counterpart.id,
                  "ASKED_MONEY_OR_RUDE"
                );
                setShowReportMenu(false);
              }}
              className="flex items-center justify-between rounded-xl border border-red-200 bg-white px-3 py-2 text-left font-semibold text-charcoal hover:bg-red-50"
            >
              <span>
                {lang === "tr"
                  ? "💸 Ücretsiz eşya için para / IBAN talep etti veya kaba davrandı"
                  : "💸 Asked for money / IBAN on a free item or rude behavior"}
              </span>
              <span className="font-extrabold text-terracotta">-2.0°C</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await onBlockUser(counterpart.id);
                setShowReportMenu(false);
                onSelectListingId(null);
              }}
              className="flex items-center justify-between rounded-xl border border-red-300 bg-red-100/70 px-3 py-2 text-left font-bold text-terracotta hover:bg-red-100"
            >
              <span>
                {lang === "tr"
                  ? `🚫 ${counterpart.displayName} kişisini engelle ve sohbeti gizle`
                  : `🚫 Block ${counterpart.displayName} & hide thread`}
              </span>
              <span className="text-[10px] uppercase">Engelle</span>
            </button>
          </div>
        </div>
      )}

      {/* Karrot Compact Pinned Item Bar + 1-Tap Coordinator Chips */}
      <div className="border-b border-[#F1EFEA] bg-[#FAF8F5]/60 px-3.5 py-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentListing.photoUrl}
              alt={currentListing.titleTr}
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-bosporus">
                  {currentListing.status === "AVAILABLE"
                    ? lang === "tr"
                      ? "Müsait"
                      : "Available"
                    : currentListing.status === "RESERVED"
                    ? lang === "tr"
                      ? "Sözleşildi"
                      : "Reserved"
                    : lang === "tr"
                    ? "Verildi"
                    : "Given"}
                </span>
                <span className="truncate text-xs font-semibold text-charcoal">
                  {lang === "tr"
                    ? currentListing.titleTr
                    : currentListing.titleEn}
                </span>
              </div>
              <span className="block text-[11px] text-stone">
                {lang === "tr" ? "Ücretsiz Paylaşım" : "Free Gift"} •{" "}
                {currentListing.safeSpotName}
              </span>
            </div>
          </div>

          {currentListing.securityPickupCode && (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-bosporus px-2 py-1 font-mono text-[10px] font-black text-white">
              <KeyRound className="h-3 w-3 text-amberbell" />
              {currentListing.securityPickupCode}
            </span>
          )}
        </div>

        {/* Karrot 1-Tap Action Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              const spot =
                currentListing.safeSpotName || neighborhood.safeSpots[0];
              onSendMessage({
                listingId: currentListing.id,
                receiverId: counterpart.id,
                messageType: "SAFE_SPOT_PIN",
                textTr: `📍 Buluşma noktası: ${spot}`,
                textEn: `📍 Meetup spot: ${spot}`,
                safeSpotName: spot,
              });
            }}
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-charcoal"
          >
            <MapPin className="h-3 w-3 text-bosporus" />
            {lang === "tr" ? "Konum Paylaş" : "Share Spot"}
          </button>

          <button
            type="button"
            onClick={() => {
              onSendMessage({
                listingId: currentListing.id,
                receiverId: counterpart.id,
                messageType: "PICKUP_TIME",
                textTr: "⏰ Buluşma saati: Bugün 18:30 (30dk önce hatırlatılır)",
                textEn: "⏰ Pickup time: Today 18:30 (30m reminder set)",
                pickupTime: "Bugün 18:30",
              });
            }}
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-charcoal"
          >
            <Clock className="h-3 w-3 text-amberbell" />
            {lang === "tr" ? "Saat Ayarla" : "Set Time"}
          </button>

          {currentListing.status === "AVAILABLE" && (
            <button
              type="button"
              onClick={() =>
                onReserveForNeighbor(currentListing.id, counterpart.id)
              }
              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-bosporus"
            >
              <Handshake className="h-3 w-3" />
              {lang === "tr" ? "Sözleş" : "Reserve"}
            </button>
          )}

          {currentListing.status !== "GIVEN" && (
            <button
              type="button"
              onClick={() => onOpenHandoffReview(currentListing)}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-sage px-2.5 py-1 text-[11px] font-bold text-white"
            >
              <Sparkles className="h-3 w-3" />
              {lang === "tr" ? "Teslim Edildi" : "Mark Given"}
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
        {threadMessages.map((msg) => {
          const isMe = msg.senderId === activeUser.id;

          if (
            msg.messageType === "SYSTEM" ||
            msg.messageType === "SECURITY_CODE"
          ) {
            return (
              <div
                key={msg.id}
                className="mx-auto max-w-[90%] rounded-xl bg-[#FAF8F5] border border-[#E5E7EB] px-3 py-2 text-center text-[11px] font-medium text-charcoal"
              >
                {showEnglish ? msg.textEn : msg.textTr}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-1.5 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {isMe && (
                <span className="text-[10px] text-stone">{msg.createdAt}</span>
              )}
              <div
                className={`max-w-[76%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug ${
                  isMe
                    ? "bg-bosporus text-white rounded-br-xs"
                    : "bg-[#F3F2EE] text-charcoal rounded-bl-xs"
                }`}
              >
                {showEnglish ? msg.textEn : msg.textTr}
              </div>
              {!isMe && (
                <span className="text-[10px] text-stone">{msg.createdAt}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Message Input */}
      <form
        onSubmit={handleSendText}
        className="flex items-center gap-2 border-t border-[#F1EFEA] bg-white px-3 py-2.5"
      >
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={
            lang === "tr" ? "Mesaj yazın..." : "Write a message..."
          }
          className="flex-1 rounded-full bg-[#F3F2EE] px-4 py-2 text-xs text-charcoal focus:outline-none"
        />
        <button
          type="submit"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-amberbell text-charcoal"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
