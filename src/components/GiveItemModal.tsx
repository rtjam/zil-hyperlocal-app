"use client";

import React, { useRef, useState } from "react";
import {
  CategoryId,
  ConditionTag,
  Language,
  Neighborhood,
  PickupType,
} from "@/lib/types";
import {
  checkProhibitedContent,
  suggestCategoryFromText,
} from "@/lib/temperature";
import { compressImageToWebP } from "@/lib/imageCompression";
import { X, Camera, Sparkles, ShieldAlert, Plus } from "lucide-react";

interface GiveItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhood: Neighborhood;
  lang: Language;
  onSubmitListing: (payload: {
    title: string;
    description: string;
    photoUrl: string;
    photoUrls: string[];
    category: Exclude<CategoryId, "ALL">;
    conditionTag: ConditionTag;
    pickupType: PickupType;
    safeSpotName: string;
  }) => Promise<string | null>;
}

const PHOTO_PRESETS = [
  {
    labelTr: "Mobilya",
    labelEn: "Furniture",
    url: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80",
    sampleTitleTr: "Masif Ahşap Balkon Sandalyesi (2 Adet)",
    sampleTitleEn: "Solid Wood Balcony Chairs (Set of 2)",
    cat: "HOME" as const,
  },
  {
    labelTr: "Bebek",
    labelEn: "Baby",
    url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80",
    sampleTitleTr: "Ahşap Eğitici Bebek Oyuncak Seti",
    sampleTitleEn: "Wooden Educational Baby Toy Set",
    cat: "BABY_KIDS" as const,
  },
  {
    labelTr: "Kitap",
    labelEn: "Books",
    url: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
    sampleTitleTr: "Dünya Klasikleri Kitap Seti (6 Adet)",
    sampleTitleEn: "World Classics Books Bundle (6 Books)",
    cat: "BOOKS_HOBBY" as const,
  },
  {
    labelTr: "Bitki",
    labelEn: "Plant",
    url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80",
    sampleTitleTr: "Seramik Saksıda Aloe Vera",
    sampleTitleEn: "Aloe Vera in Ceramic Pot",
    cat: "PLANTS" as const,
  },
];

export function GiveItemModal({
  isOpen,
  onClose,
  neighborhood,
  lang,
  onSubmitListing,
}: GiveItemModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([
    PHOTO_PRESETS[0].url,
  ]);
  const [compressing, setCompressing] = useState(false);
  const [category, setCategory] =
    useState<Exclude<CategoryId, "ALL">>("HOME");
  const [aiSuggested, setAiSuggested] = useState(false);
  const [pickupType, setPickupType] = useState<PickupType>("SITE_SECURITY");
  const [conditionTag, setConditionTag] = useState<ConditionTag>("LIKE_NEW");
  const [safeSpotName, setSafeSpotName] = useState(
    neighborhood.safeSpots[0] || "Moda İskelesi Meydanı"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setErrorMsg(null);
    const suggested = suggestCategoryFromText(`${val} ${description}`);
    if (suggested) {
      setCategory(suggested);
      setAiSuggested(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCompressing(true);
    try {
      const compressedList: string[] = [];
      const limit = Math.min(files.length, 5 - selectedPhotos.length);
      for (let i = 0; i < limit; i++) {
        const webpData = await compressImageToWebP(files[i]);
        compressedList.push(webpData);
      }
      setSelectedPhotos((prev) => [...prev, ...compressedList].slice(0, 5));
    } catch {
      setErrorMsg(
        lang === "tr"
          ? "Fotoğraf sıkıştırılırken hata oluştu."
          : "Failed to compress photo."
      );
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length > 0 ? next : [PHOTO_PRESETS[0].url];
    });
  };

  const prohibitedCheck = checkProhibitedContent(`${title} ${description}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg(
        lang === "tr" ? "Lütfen bir başlık yazın." : "Please enter a title."
      );
      return;
    }
    if (prohibitedCheck.blocked) return;

    setSubmitting(true);
    const err = await onSubmitListing({
      title: title.trim(),
      description:
        description.trim() ||
        (lang === "tr"
          ? "Temiz durumda, ihtiyacı olan bir komşumuza hediye."
          : "Clean condition, free gift for a neighbor."),
      photoUrl: selectedPhotos[0] || PHOTO_PRESETS[0].url,
      photoUrls: selectedPhotos,
      category,
      conditionTag,
      pickupType,
      safeSpotName,
    });
    setSubmitting(false);

    if (err) {
      setErrorMsg(err);
    } else {
      setTitle("");
      setDescription("");
      setSelectedPhotos([PHOTO_PRESETS[0].url]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="flex h-dvh w-full max-w-[430px] flex-col bg-white shadow-2xl"
      >
        {/* Minimalist Karrot Top Bar */}
        <div className="flex h-13 items-center justify-between border-b border-[#F1EFEA] px-4">
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-charcoal"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="text-[15px] font-bold text-charcoal">
            {lang === "tr" ? "Komşuna Hediye Ver" : "Share Free Gift"}
          </span>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-bosporus">
            {lang === "tr" ? "Ücretsiz" : "Free"}
          </span>
        </div>

        {/* Form Body */}
        <div className="flex-1 divide-y divide-[#F1EFEA] overflow-y-auto px-4">
          {/* Karrot Multi-Photo Camera Strip (1-5 Photos + WebP Compression) */}
          <div className="py-4 space-y-2.5">
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
              {/* Hidden Native Camera/Gallery Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Karrot Camera Trigger Box */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedPhotos.length >= 5 || compressing}
                className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-gray-300 bg-[#FAF8F5] text-stone hover:border-bosporus hover:text-bosporus transition-colors disabled:opacity-40"
              >
                <Camera className="h-5 w-5" />
                <span className="mt-0.5 text-[10px] font-bold">
                  {compressing
                    ? "WebP..."
                    : `${selectedPhotos.length}/5`}
                </span>
              </button>

              {/* Selected Photo Thumbnails */}
              {selectedPhotos.map((url, idx) => (
                <div
                  key={`${idx}-${url.slice(0, 24)}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200"
                >
                  <img
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute inset-x-0 bottom-0 bg-bosporus/85 py-0.5 text-center text-[8px] font-bold text-white">
                      {lang === "tr" ? "Kapak" : "Cover"}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Sample Photo Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              <span className="shrink-0 text-[10px] font-semibold text-stone">
                {lang === "tr" ? "Hızlı Şablon:" : "Presets:"}
              </span>
              {PHOTO_PRESETS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    if (!selectedPhotos.includes(preset.url)) {
                      setSelectedPhotos((prev) =>
                        [preset.url, ...prev].slice(0, 5)
                      );
                    }
                    if (!title) {
                      setTitle(
                        lang === "tr"
                          ? preset.sampleTitleTr
                          : preset.sampleTitleEn
                      );
                      setCategory(preset.cat);
                    }
                  }}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-[#FAF8F5] px-2 py-1 text-[10px] font-semibold text-charcoal hover:border-bosporus"
                >
                  <Plus className="h-2.5 w-2.5 text-bosporus" />
                  {lang === "tr" ? preset.labelTr : preset.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div className="py-3.5">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={
                lang === "tr" ? "Eşya başlığı yazın" : "Enter item title"
              }
              className="w-full text-[15px] font-medium text-charcoal placeholder:text-stone/60 focus:outline-none"
            />
          </div>

          {/* Category Horizontal Pills */}
          <div className="py-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone">
                {lang === "tr" ? "Kategori" : "Category"}
              </span>
              {aiSuggested && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage">
                  <Sparkles className="h-3 w-3" />
                  {lang === "tr" ? "Otomatik seçildi" : "Auto-suggested"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "URGENT", tr: "⚡ Hemen Al", en: "⚡ Curb Alert" },
                  { id: "HOME", tr: "🛋️ Ev & Mobilya", en: "🛋️ Home" },
                  { id: "BABY_KIDS", tr: "👶 Bebek", en: "👶 Baby" },
                  { id: "BOOKS_HOBBY", tr: "📚 Kitap", en: "📚 Books" },
                  { id: "PLANTS", tr: "🌱 Bitki", en: "🌱 Plants" },
                  { id: "PETS", tr: "🐾 Evcil Hayvan", en: "🐾 Pets" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    category === cat.id
                      ? "bg-bosporus text-white"
                      : "bg-[#FAF8F5] text-charcoal border border-gray-200"
                  }`}
                >
                  {lang === "tr" ? cat.tr : cat.en}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Description */}
          <div className="py-3.5">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                lang === "tr"
                  ? "Komşularına eşyanın durumunu ve ne zaman teslim alabileceklerini kısaca anlat (Otomatik İngilizceye de çevrilir)..."
                  : "Briefly describe condition and pickup details (Auto-translated for neighbors)..."
              }
              className="w-full resize-none text-sm text-charcoal placeholder:text-stone/60 focus:outline-none"
            />
          </div>

          {/* Pickup Type & Safe Spot */}
          <div className="py-3.5 space-y-2.5">
            <span className="block text-xs font-semibold text-stone">
              {lang === "tr" ? "Teslimat Yöntemi" : "Pickup Method"}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  {
                    id: "SITE_SECURITY",
                    tr: "🏢 Site Güvenliği",
                    en: "🏢 Security Desk",
                  },
                  {
                    id: "SAFE_SPOT",
                    tr: "☕ Güvenli Nokta",
                    en: "☕ Safe Spot",
                  },
                  {
                    id: "DOORSTEP",
                    tr: "🚪 Kapı Önü (3s)",
                    en: "🚪 Curb (3h)",
                  },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPickupType(p.id)}
                  className={`rounded-xl border py-2 px-1.5 text-[11px] font-bold transition-all ${
                    pickupType === p.id
                      ? "border-bosporus bg-teal-50/70 text-bosporus"
                      : "border-gray-200 text-stone"
                  }`}
                >
                  {lang === "tr" ? p.tr : p.en}
                </button>
              ))}
            </div>

            <select
              value={safeSpotName}
              onChange={(e) => setSafeSpotName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#FAF8F5] px-3 py-2 text-xs font-medium text-charcoal focus:outline-none"
            >
              {neighborhood.safeSpots.map((spot) => (
                <option key={spot} value={spot}>
                  📍 {spot}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Row */}
          <div className="py-3.5 space-y-2">
            <span className="block text-xs font-semibold text-stone">
              {lang === "tr" ? "Durumu" : "Condition"}
            </span>
            <div className="flex gap-2">
              {(
                [
                  { id: "LIKE_NEW", tr: "Yeni Gibi", en: "Like New" },
                  { id: "GOOD", tr: "İyi Durumda", en: "Good" },
                  { id: "FUNCTIONAL", tr: "İş Görür", en: "Functional" },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setConditionTag(c.id)}
                  className={`flex-1 rounded-xl border py-2 text-xs font-bold ${
                    conditionTag === c.id
                      ? "border-bosporus bg-bosporus text-white"
                      : "border-gray-200 text-charcoal"
                  }`}
                >
                  {lang === "tr" ? c.tr : c.en}
                </button>
              ))}
            </div>
          </div>

          {prohibitedCheck.blocked && (
            <div className="py-3">
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-terracotta">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>
                  {lang === "tr"
                    ? `"${prohibitedCheck.keyword}" içeren ürünler (ilaç, tütün, alkol vb.) paylaşılamaz.`
                    : `Regulated items ("${prohibitedCheck.keyword}") cannot be shared.`}
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="py-2 text-xs font-semibold text-terracotta">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Sticky Bottom Submit Button */}
        <div className="border-t border-[#F1EFEA] bg-white p-4">
          <button
            type="submit"
            disabled={submitting || prohibitedCheck.blocked}
            className="w-full rounded-xl bg-amberbell py-3.5 text-sm font-extrabold text-charcoal shadow-2xs disabled:opacity-40"
          >
            {submitting
              ? "..."
              : lang === "tr"
              ? "Mahallede Paylaş"
              : "Share with Neighborhood"}
          </button>
        </div>
      </form>
    </div>
  );
}
