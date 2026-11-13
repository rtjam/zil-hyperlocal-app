"use client";

import React, { useState } from "react";
import { AuthProvider, Language, Neighborhood } from "@/lib/types";
import { getSupabaseOAuthUrl } from "@/lib/supabase";
import {
  MapPin,
  ShieldCheck,
  Navigation,
  Phone,
  CheckCircle2,
  ChevronLeft,
  X,
  Sparkles,
} from "lucide-react";

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods: Neighborhood[];
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onCompleteOnboarding: (payload: {
    displayName: string;
    phone: string;
    email?: string;
    authProvider?: AuthProvider;
    socialHandle?: string;
    neighborhoodId: string;
    preferredLang: Language;
  }) => Promise<void>;
}

export function OnboardingFlow({
  isOpen,
  onClose,
  neighborhoods,
  lang,
  onChangeLang,
  onCompleteOnboarding,
}: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedProvider, setSelectedProvider] =
    useState<AuthProvider>("google");
  const [selectedNbId, setSelectedNbId] = useState(
    neighborhoods[0]?.id || "nb-moda"
  );
  const [gpsStatus, setGpsStatus] = useState<
    "IDLE" | "LOCATING" | "VERIFIED"
  >("VERIFIED");
  const [coordsText, setCoordsText] = useState("40.9848° N, 29.0254° E");

  // Step 3: Profile, Social Handle & SMS OTP / KVKK
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [phone, setPhone] = useState("532 418 92 10");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [kvkkConsent, setKvkkConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedNb =
    neighborhoods.find((n) => n.id === selectedNbId) || neighborhoods[0];

  const handleSelectOAuthProvider = (provider: AuthProvider) => {
    const liveUrl = getSupabaseOAuthUrl(provider);
    if (liveUrl) {
      window.location.href = liveUrl;
      return;
    }

    setSelectedProvider(provider);
    if (provider === "google" && !displayName) {
      setDisplayName("Emre K.");
      setEmail("emre.kadikoy@gmail.com");
      setSocialHandle("google.com/emre.k");
    } else if (provider === "apple" && !displayName) {
      setDisplayName("Selin Y.");
      setEmail("selin.y@icloud.com");
      setSocialHandle("appleid/selin.y");
    } else if (provider === "instagram" && !displayName) {
      setDisplayName("Deniz A.");
      setEmail("deniz.moda@instagram.com");
      setSocialHandle("@deniz.moda");
    } else if (provider === "facebook" && !displayName) {
      setDisplayName("Barış T.");
      setEmail("baris.t@facebook.com");
      setSocialHandle("fb.com/baris.t");
    }
    setStep(2);
  };

  const handleLocateGps = () => {
    setGpsStatus("LOCATING");
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordsText(
            `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`
          );
          setGpsStatus("VERIFIED");
        },
        () => {
          setCoordsText(
            `${selectedNb.centerLat.toFixed(4)}° N, ${selectedNb.centerLng.toFixed(4)}° E`
          );
          setGpsStatus("VERIFIED");
        },
        { timeout: 3000 }
      );
    } else {
      setTimeout(() => {
        setCoordsText(
          `${selectedNb.centerLat.toFixed(4)}° N, ${selectedNb.centerLng.toFixed(4)}° E`
        );
        setGpsStatus("VERIFIED");
      }, 500);
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkkConsent) return;
    setSubmitting(true);
    await onCompleteOnboarding({
      displayName: displayName.trim() || "Emre K.",
      phone: `+90 ${phone}`,
      email: email || undefined,
      authProvider: selectedProvider,
      socialHandle: socialHandle || undefined,
      neighborhoodId: selectedNbId,
      preferredLang: lang,
    });
    setSubmitting(false);
    setStep(1);
    setOtpSent(false);
    setOtpInput("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/40">
      <div className="flex h-dvh w-full max-w-[430px] flex-col bg-white shadow-2xl">
        {/* Top Minimal Navigation Bar */}
        <div className="flex h-13 items-center justify-between border-b border-[#F1EFEA] px-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="p-1 text-charcoal"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <span className="w-6" />
          )}

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s ? "w-6 bg-bosporus" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone hover:text-charcoal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STEP 1: Karrot Welcome + Social Auth (Google, Apple, Instagram/Facebook, Phone) */}
        {step === 1 && (
          <div className="flex flex-1 flex-col justify-between p-5 text-center overflow-y-auto">
            <div className="mt-2 flex flex-col items-center">
              {/* Concentric Doorbell Pin Illustration */}
              <div className="relative flex h-28 w-28 items-center justify-center">
                <span className="absolute inset-0 rounded-full border border-bosporus/15 bg-teal-50/40 animate-pulse" />
                <span className="absolute inset-4 rounded-full border border-bosporus/25 bg-teal-50/70" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-bosporus shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F5]">
                    <span className="h-5 w-5 rounded-full bg-amberbell shadow-[0_0_12px_#F59E0B]" />
                  </div>
                </div>
              </div>

              <h1 className="mt-4 text-xl font-black tracking-tight text-charcoal">
                {lang === "tr"
                  ? "Komşunun Ziline Bas"
                  : "Ring Your Neighbor's Bell"}
              </h1>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-stone">
                {lang === "tr"
                  ? "GPS ile doğrulanmış kendi mahallendeki komşularınla %100 ücretsiz paylaşım ve dayanışma ağı."
                  : "100% free hyperlocal sharing network locked to GPS-verified neighbors in your mahalle."}
              </p>

              {/* Language Selector Pills */}
              <div className="mt-3.5 inline-flex rounded-xl bg-[#FAF8F5] p-1 border border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => onChangeLang("tr")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    lang === "tr"
                      ? "bg-white text-bosporus shadow-2xs"
                      : "text-stone"
                  }`}
                >
                  🇹🇷 Türkçe
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLang("en")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    lang === "en"
                      ? "bg-white text-bosporus shadow-2xs"
                      : "text-stone"
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Social OAuth + Phone Sign-In Stack */}
            <div className="mt-5 space-y-2.5 text-left">
              {/* 1. Continue with Google */}
              <button
                type="button"
                onClick={() => handleSelectOAuthProvider("google")}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-gray-200 bg-white py-3 text-xs font-extrabold text-charcoal shadow-2xs hover:bg-gray-50 active:scale-99"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.4 7.4 24 12 24z"
                  />
                </svg>
                {lang === "tr"
                  ? "Google ile Devam Et"
                  : "Continue with Google"}
              </button>

              {/* 2. Continue with Apple */}
              <button
                type="button"
                onClick={() => handleSelectOAuthProvider("apple")}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-charcoal py-3 text-xs font-extrabold text-white shadow-2xs hover:bg-black active:scale-99"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                {lang === "tr" ? "Apple ile Devam Et" : "Continue with Apple"}
              </button>

              {/* 3. Instagram & Facebook Row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectOAuthProvider("instagram")}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-50 via-purple-50 to-amber-50 py-2.5 text-xs font-extrabold text-charcoal hover:opacity-90"
                >
                  <span className="text-sm">📸</span>
                  <span>Instagram</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectOAuthProvider("facebook")}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/70 py-2.5 text-xs font-extrabold text-[#1877F2] hover:bg-blue-100/70"
                >
                  <span className="font-black text-sm">f</span>
                  <span>Facebook</span>
                </button>
              </div>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-gray-200" />
                <span className="mx-3 shrink-0 text-[10px] font-semibold uppercase text-stone">
                  {lang === "tr" ? "veya" : "or"}
                </span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              {/* 4. Turkish SMS OTP (+90) Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedProvider("phone");
                  setStep(2);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amberbell py-3 text-xs font-extrabold text-charcoal shadow-2xs"
              >
                <Phone className="h-3.5 w-3.5" />
                {lang === "tr"
                  ? "Cep Telefonu (+90 SMS) ile Başla"
                  : "Continue with Phone (+90 SMS OTP)"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Karrot GPS Polygon Verification ("동네 인증하기") */}
        {step === 2 && (
          <div className="flex flex-1 flex-col justify-between p-5">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-bosporus">
                  {lang === "tr" ? "Adım 1 / 2 • Zil Kaydı" : "Step 1 / 2 • GPS Lock"}
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-charcoal">
                  {lang === "tr"
                    ? "Mahalle Poligonu GPS Doğrulaması"
                    : "Mahalle Polygon GPS Verification"}
                </h2>
                <p className="mt-0.5 text-xs text-stone">
                  {lang === "tr"
                    ? "Ülke genelinden ilan görülmez; yalnızca fiziksel olarak bulunduğun mahalle kilitlenir."
                    : "Nationwide browsing is disabled; only your physical mahalle polygon is unlocked."}
                </p>
              </div>

              {/* Pilot Mahalle Picker */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone">
                  {lang === "tr"
                    ? "Pilot Mahalle Seçin veya GPS ile Bulun"
                    : "Select Pilot Mahalle or Detect via GPS"}
                </label>
                {neighborhoods.map((nb) => {
                  const active = nb.id === selectedNbId;
                  return (
                    <button
                      key={nb.id}
                      type="button"
                      onClick={() => {
                        setSelectedNbId(nb.id);
                        setCoordsText(
                          `${nb.centerLat.toFixed(4)}° N, ${nb.centerLng.toFixed(4)}° E`
                        );
                        setGpsStatus("VERIFIED");
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                        active
                          ? "border-bosporus bg-teal-50/60"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin
                          className={`h-4 w-4 ${
                            active ? "text-bosporus" : "text-stone"
                          }`}
                        />
                        <div>
                          <span className="block text-xs font-bold text-charcoal">
                            {lang === "tr" ? nb.nameTr : nb.nameEn}
                          </span>
                          <span className="text-[11px] text-stone">
                            {nb.district}, {nb.city}
                          </span>
                        </div>
                      </div>
                      {active && (
                        <CheckCircle2 className="h-4 w-4 text-sage" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Live Geolocation Trigger Card */}
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF8F5] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-dark">
                    <ShieldCheck className="h-4 w-4 text-sage" />
                    {gpsStatus === "LOCATING"
                      ? lang === "tr"
                        ? "GPS Uydusu Aranıyor..."
                        : "Locating GPS..."
                      : lang === "tr"
                      ? "PostGIS Poligonu Doğrulandı"
                      : "PostGIS Polygon Verified"}
                  </span>
                  <span className="font-mono text-[10px] text-stone">
                    {coordsText}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLocateGps}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-bosporus shadow-2xs"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  {lang === "tr"
                    ? "Tarayıcı GPS Konumumu Test Et"
                    : "Test Browser Live GPS"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full rounded-2xl bg-bosporus py-3.5 text-sm font-extrabold text-white"
            >
              {lang === "tr"
                ? "Bu Mahalle ile Devam Et"
                : "Continue with This Mahalle"}
            </button>
          </div>
        )}

        {/* STEP 3: Social Identity Summary + Turkish SMS OTP (+90) & KVKK */}
        {step === 3 && (
          <form
            onSubmit={handleFinish}
            className="flex flex-1 flex-col justify-between p-5 overflow-y-auto"
          >
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-bosporus">
                    {lang === "tr"
                      ? "Adım 2 / 2 • Profil & Doğrulama"
                      : "Step 2 / 2 • Profile & Verification"}
                  </span>
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-extrabold text-bosporus uppercase">
                    {selectedProvider} Bağlandı ✓
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-extrabold text-charcoal">
                  {lang === "tr"
                    ? "Komşu Kartını Tamamla"
                    : "Complete Your Neighbor Card"}
                </h2>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-stone">
                  {lang === "tr"
                    ? "Adın ve Soyadının Baş Harfi"
                    : "First Name & Last Initial"}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={lang === "tr" ? "Örn: Emre K." : "e.g., Emre K."}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-semibold text-charcoal focus:border-bosporus focus:outline-none"
                />
              </div>

              {/* Connected Social Handle (Instagram/Google/Apple) */}
              {selectedProvider !== "phone" && (
                <div>
                  <label className="block text-xs font-semibold text-stone">
                    {lang === "tr"
                      ? "Doğrulanmış Sosyal Hesap (Komşu Güveni İçin)"
                      : "Verified Social Account (For Neighbor Trust)"}
                  </label>
                  <input
                    type="text"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    placeholder="@kullanici_adi"
                    className="mt-1 w-full rounded-xl border border-teal-200 bg-teal-50/40 px-3.5 py-2 text-xs font-bold text-bosporus focus:outline-none"
                  />
                </div>
              )}

              {/* +90 Phone Number + Send OTP */}
              <div>
                <label className="block text-xs font-semibold text-stone">
                  {lang === "tr"
                    ? "Cep Telefonu (Komşularla asla paylaşılmaz)"
                    : "Mobile Number (Never shared with neighbors)"}
                </label>
                <div className="mt-1 flex gap-2">
                  <span className="flex items-center rounded-xl border border-gray-200 bg-[#FAF8F5] px-3 text-xs font-bold text-charcoal">
                    🇹🇷 +90
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-charcoal focus:border-bosporus focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(true);
                      setOtpInput("482910");
                    }}
                    className="shrink-0 rounded-xl bg-bosporus px-3 py-2 text-xs font-bold text-white"
                  >
                    {otpSent
                      ? lang === "tr"
                        ? "Gönderildi"
                        : "Sent"
                      : lang === "tr"
                      ? "SMS Gönder"
                      : "Send OTP"}
                  </button>
                </div>
              </div>

              {/* 6-Digit OTP Box */}
              {otpSent && (
                <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-bosporus flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {lang === "tr"
                        ? "Netgsm 6 Haneli SMS Kodu:"
                        : "6-Digit SMS OTP Code:"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sage-dark">
                      <Sparkles className="h-3 w-3" />
                      Otomatik dolduruldu
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full rounded-xl border border-bosporus bg-white px-3 py-1.5 text-center font-mono text-base font-black tracking-[0.35em] text-bosporus"
                  />
                </div>
              )}

              {/* KVKK Explicit Consent */}
              <label className="flex items-start gap-2.5 rounded-2xl bg-[#FAF8F5] p-3 text-xs text-stone cursor-pointer border border-[#E5E7EB]">
                <input
                  type="checkbox"
                  checked={kvkkConsent}
                  onChange={(e) => setKvkkConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-bosporus"
                />
                <span>
                  <strong className="text-charcoal">
                    {lang === "tr"
                      ? "KVKK Aydınlatma Metni & Mahalle Kuralları:"
                      : "KVKK Privacy & Community Rules:"}
                  </strong>{" "}
                  {lang === "tr"
                    ? "Açık ev koordinatlarımın kaydedilmemesini (250m bulanıklaştırma) ve ZiL'de yalnızca %100 ücretsiz paylaşım yapmayı kabul ediyorum."
                    : "I consent to 250m coordinate fuzzing for privacy and agree that all ZiL listings are 100% free."}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!kvkkConsent || submitting}
              className="mt-3 w-full rounded-2xl bg-amberbell py-3.5 text-sm font-extrabold text-charcoal shadow-sm disabled:opacity-40"
            >
              {submitting
                ? "..."
                : lang === "tr"
                ? "🔔 Onaylı Komşu Olarak Başla (36.5°C)"
                : "🔔 Join as Verified Neighbor (36.5°C)"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
