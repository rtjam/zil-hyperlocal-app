"use client";

import React, { useState } from "react";
import {
  AuthProvider,
  Language,
  Neighborhood,
  NeighborUser,
} from "@/lib/types";
import { getTemperatureTier } from "@/lib/temperature";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  ShieldCheck,
  MapPin,
  RefreshCw,
  RotateCcw,
  ChevronRight,
  Smartphone,
  Database,
  LogOut,
  Check,
  Trash2,
} from "lucide-react";

interface KomsuKartimTabProps {
  activeUser: NeighborUser;
  users: NeighborUser[];
  neighborhood: Neighborhood;
  lang: Language;
  onSwitchUser: (userId: string) => Promise<void>;
  onVerifyGps: () => Promise<void>;
  onResetDemo: () => Promise<void>;
  onOpenOnboarding: () => void;
  onToggleSocialProvider: (provider: AuthProvider) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export function KomsuKartimTab({
  activeUser,
  users,
  neighborhood,
  lang,
  onSwitchUser,
  onVerifyGps,
  onResetDemo,
  onOpenOnboarding,
  onToggleSocialProvider,
  onDeleteAccount,
}: KomsuKartimTabProps) {
  const [verifying, setVerifying] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tier = getTemperatureTier(activeUser.mannerTemp);
  const progressPercent = Math.min(
    100,
    Math.max(8, ((activeUser.mannerTemp - 30) / (65 - 30)) * 100)
  );

  const daysSinceVerify = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(activeUser.lastGpsVerifiedAt).getTime()) /
        (24 * 3600 * 1000)
    )
  );
  const daysRemaining = Math.max(1, 30 - daysSinceVerify);
  const hasUnlimitedClaims = activeUser.itemsGivenCount >= 1;
  const supabaseLive = isSupabaseConfigured();
  const connected = activeUser.connectedProviders || [
    activeUser.authProvider || "google",
    "phone",
  ];

  return (
    <div className="divide-y divide-[#F1EFEA]">
      {/* 1. Karrot Minimalist Profile Header + Manner Temperature Bar */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-extrabold ${activeUser.avatarColor}`}
            >
              {activeUser.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-charcoal">
                  {activeUser.displayName}
                </h2>
                <span className="inline-flex items-center gap-0.5 rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-bosporus">
                  <ShieldCheck className="h-3 w-3 text-sage" />
                  {lang === "tr" ? "Onaylı" : "Verified"}
                </span>
              </div>
              <p className="text-xs text-stone">
                {lang === "tr" ? neighborhood.nameTr : neighborhood.nameEn} •{" "}
                {activeUser.socialHandle ||
                  activeUser.phoneMasked ||
                  "+90 532 ••• •• 84"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-center">
            <div>
              <span className="block text-sm font-extrabold text-bosporus">
                {activeUser.itemsGivenCount}
              </span>
              <span className="text-[10px] text-stone">
                {lang === "tr" ? "Verilen" : "Given"}
              </span>
            </div>
            <div className="h-6 w-[1px] bg-gray-200" />
            <div>
              <span className="block text-sm font-extrabold text-charcoal">
                {activeUser.itemsReceivedCount}
              </span>
              <span className="text-[10px] text-stone">
                {lang === "tr" ? "Alınan" : "Received"}
              </span>
            </div>
          </div>
        </div>

        {/* Karrot Iconic Manner Temperature Card */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF8F5]/70 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal underline decoration-dotted">
              {lang === "tr" ? "Komşuluk Derecesi" : "Manner Temperature"}
            </span>
            <div className="flex items-center gap-1">
              <span className={`text-base font-black ${tier.badgeText}`}>
                {activeUser.mannerTemp.toFixed(1)}°C
              </span>
              <span className="text-base">{tier.icon}</span>
            </div>
          </div>

          {/* 36.5°C Baseline Marker */}
          <div className="relative mt-2 pt-3">
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center text-[9px] text-stone"
              style={{ left: "24%" }}
            >
              <span>{lang === "tr" ? "İlk 36.5°C" : "Start 36.5°C"}</span>
              <span className="leading-none">▾</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${tier.barColor}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <p className="mt-2 text-[11px] text-stone">
            {lang === "tr" ? tier.descriptionTr : tier.descriptionEn}
          </p>
        </div>
      </div>

      {/* 2. Connected Social Accounts & OAuth Providers (Google, Apple, Instagram, Facebook, +90) */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-charcoal">
            {lang === "tr"
              ? "Bağlı Hesaplar & Kimlik Doğrulama"
              : "Connected Accounts & OAuth"}
          </span>
          <span className="text-[11px] font-semibold text-sage">
            {connected.length}{" "}
            {lang === "tr" ? "Doğrulandı" : "Verified"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "google" as const, label: "Google", icon: "G" },
              { id: "apple" as const, label: "Apple ID", icon: "" },
              { id: "instagram" as const, label: "Instagram", icon: "📸" },
              { id: "facebook" as const, label: "Facebook", icon: "f" },
            ] as const
          ).map((prov) => {
            const isLinked = connected.includes(prov.id);
            return (
              <button
                key={prov.id}
                type="button"
                onClick={() => onToggleSocialProvider(prov.id)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                  isLinked
                    ? "border-teal-200 bg-teal-50/50 text-bosporus"
                    : "border-gray-200 bg-white text-stone"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{prov.icon}</span>
                  <span>{prov.label}</span>
                </span>
                {isLinked ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-sage-dark">
                    <Check className="h-3 w-3" />
                    {lang === "tr" ? "Bağlı" : "Linked"}
                  </span>
                ) : (
                  <span className="text-[10px] text-stone">
                    {lang === "tr" ? "+ Bağla" : "+ Link"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Neighborhood Badges Row */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-charcoal">
            {lang === "tr" ? "Mahalle Rozetleri" : "Neighborhood Badges"}
          </span>
          <span className="text-[11px] text-stone">
            {activeUser.badges.length} / 3
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            {
              id: "ZERO_WASTE_HERO" as const,
              icon: "🌱",
              tr: "Sıfır Atık",
              en: "Zero Waste",
            },
            {
              id: "EXPAT_FRIENDLY" as const,
              icon: "🌍",
              tr: "Yabancı Dostu",
              en: "Expat Friendly",
            },
            {
              id: "FAST_RESPONDER" as const,
              icon: "⚡",
              tr: "Hızlı Komşu",
              en: "Fast Reply",
            },
          ].map((b) => {
            const unlocked = activeUser.badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={`flex flex-col items-center rounded-xl border py-2.5 px-2 text-center ${
                  unlocked
                    ? "border-teal-200 bg-teal-50/40"
                    : "border-gray-100 bg-gray-50 opacity-45"
                }`}
              >
                <span className="text-lg">{b.icon}</span>
                <span className="mt-1 text-[11px] font-bold text-charcoal">
                  {lang === "tr" ? b.tr : b.en}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Minimalist Settings & Status List Rows */}
      <div className="divide-y divide-[#F1EFEA] text-xs">
        <button
          type="button"
          onClick={onOpenOnboarding}
          className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-[#FAF8F5]"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="h-4 w-4 text-amberbell" />
            <div>
              <span className="block font-bold text-charcoal">
                {lang === "tr"
                  ? "Giriş & Kayıt Ekranı (Google / Apple / Instagram / SMS)"
                  : "Sign-In & Onboarding (Google / Apple / Instagram / SMS)"}
              </span>
              <span className="text-[11px] text-stone">
                {lang === "tr"
                  ? "Sosyal hesaplarla giriş, +90 SMS OTP ve GPS poligon akışı"
                  : "Test Social OAuth login, +90 SMS OTP, and live GPS lock"}
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-stone" />
        </button>

        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-bosporus" />
            <div>
              <span className="block font-semibold text-charcoal">
                {lang === "tr"
                  ? "Mahalle GPS Doğrulaması"
                  : "Neighborhood GPS Lock"}
              </span>
              <span className="text-[11px] text-stone">
                {daysRemaining}{" "}
                {lang === "tr" ? "gün geçerli" : "days remaining"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              setVerifying(true);
              await onVerifyGps();
              setTimeout(() => setVerifying(false), 400);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-[#FAF8F5] border border-gray-200 px-2.5 py-1.5 font-bold text-bosporus"
          >
            <RefreshCw
              className={`h-3 w-3 ${verifying ? "animate-spin" : ""}`}
            />
            {lang === "tr" ? "Doğrula" : "Verify"}
          </button>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <span className="block font-semibold text-charcoal">
              {lang === "tr"
                ? "Haftalık Hediye Talep Hakkı"
                : "Weekly Claim Quota"}
            </span>
            <span className="text-[11px] text-stone">
              {hasUnlimitedClaims
                ? lang === "tr"
                  ? "1+ eşya paylaştığın için sınırsız"
                  : "Unlimited (1+ item shared)"
                : lang === "tr"
                ? "Yeni komşu başlangıç kotası"
                : "Starter neighbor quota"}
            </span>
          </div>
          <span className="font-bold text-bosporus">
            {hasUnlimitedClaims
              ? lang === "tr"
                ? "Sınırsız"
                : "Unlimited"
              : `${activeUser.weeklyClaimsUsed} / 3`}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <Database className="h-4 w-4 text-stone" />
            <div>
              <span className="block font-semibold text-charcoal">
                {lang === "tr"
                  ? "Veritabanı & Çeviri Motoru"
                  : "DB & Translation Engine"}
              </span>
              <span className="text-[11px] text-stone">
                {supabaseLive
                  ? "Supabase PostGIS Cloud + Auto-Translate"
                  : "Serverless-Safe Store + Live TR↔EN"}
              </span>
            </div>
          </div>
          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-sage-dark">
            Aktif
          </span>
        </div>

        {/* Sign Out / Switch Account */}
        <button
          type="button"
          onClick={onOpenOnboarding}
          className="flex w-full items-center justify-between px-4 py-3.5 text-left text-charcoal hover:bg-[#FAF8F5]"
        >
          <span className="flex items-center gap-2 font-semibold">
            <LogOut className="h-4 w-4 text-stone" />
            {lang === "tr"
              ? "Oturumu Kapat / Farklı Hesapla Giriş Yap"
              : "Sign Out / Switch Account"}
          </span>
          <ChevronRight className="h-4 w-4 text-stone" />
        </button>

        {/* Apple Guideline 5.1.1(v) & KVKK Account Deletion */}
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
          className="flex w-full items-center justify-between px-4 py-3.5 text-left text-terracotta hover:bg-red-50/40"
        >
          <span className="flex items-center gap-2 font-bold">
            <Trash2 className="h-4 w-4" />
            {lang === "tr"
              ? "Hesabımı ve Verilerimi Sil (KVKK)"
              : "Delete My Account & Data"}
          </span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Confirmation Sheet for Account Deletion */}
      {showDeleteConfirm && (
        <div className="bg-red-50/80 p-4 space-y-2.5 text-xs">
          <p className="font-bold text-terracotta">
            {lang === "tr"
              ? `${activeUser.displayName} hesabını ve tüm ilanlarını kalıcı olarak silmek istediğine emin misin?`
              : `Are you sure you want to permanently delete ${activeUser.displayName} and all associated listings?`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-2 font-bold text-charcoal"
            >
              {lang === "tr" ? "Vazgeç" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={async () => {
                setShowDeleteConfirm(false);
                await onDeleteAccount();
              }}
              className="flex-1 rounded-xl bg-terracotta py-2 font-bold text-white"
            >
              {lang === "tr" ? "Kalıcı Olarak Sil" : "Delete Permanently"}
            </button>
          </div>
        </div>
      )}

      {/* 5. Compact Demo Neighbor Switcher */}
      <div className="p-4 space-y-2.5 bg-[#FAF8F5]/50">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone">
            {lang === "tr"
              ? "Demo Komşu Profili Seç"
              : "Switch Demo Neighbor"}
          </span>
          <button
            type="button"
            onClick={onResetDemo}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone hover:text-charcoal"
          >
            <RotateCcw className="h-3 w-3" />
            {lang === "tr" ? "Sıfırla" : "Reset"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {users.map((u) => {
            const active = u.id === activeUser.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onSwitchUser(u.id)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-all ${
                  active
                    ? "border-bosporus bg-white font-bold text-bosporus shadow-2xs"
                    : "border-gray-200 bg-white/60 text-charcoal"
                }`}
              >
                <span className="text-xs truncate">{u.displayName}</span>
                <span className="flex items-center gap-0.5 text-[11px] text-stone">
                  {u.mannerTemp.toFixed(1)}°
                  <ChevronRight className="h-3 w-3" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
