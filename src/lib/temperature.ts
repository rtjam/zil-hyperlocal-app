import { CategoryId, Language } from "./types";

export interface TempTierInfo {
  id: "COLD" | "GOOD" | "WARM" | "PILLAR";
  labelTr: string;
  labelEn: string;
  badgeBg: string;
  badgeText: string;
  barColor: string;
  icon: string;
  descriptionTr: string;
  descriptionEn: string;
}

export function getTemperatureTier(temp: number): TempTierInfo {
  if (temp < 34.0) {
    return {
      id: "COLD",
      labelTr: "Soğuk Komşu",
      labelEn: "Cold Neighbor",
      badgeBg: "bg-red-100 border-red-200",
      badgeText: "text-red-700",
      barColor: "bg-terracotta",
      icon: "🥶",
      descriptionTr:
        "Randevuya gelmeme (no-show) nedeniyle uyarı durumunda.",
      descriptionEn:
        "Warning state due to missed scheduled pickups (no-shows).",
    };
  }
  if (temp < 40.0) {
    return {
      id: "GOOD",
      labelTr: "İyi Komşu",
      labelEn: "Good Neighbor",
      badgeBg: "bg-teal-50 border-teal-200",
      badgeText: "text-bosporus",
      barColor: "bg-sage",
      icon: "🙂",
      descriptionTr:
        "Güvenilir mahalle sakini. Zamanında ve nazik paylaşım yapıyor.",
      descriptionEn:
        "Trusted neighborhood member. Shares and picks up politely on time.",
    };
  }
  if (temp < 50.0) {
    return {
      id: "WARM",
      labelTr: "Sıcakkanlı Komşu",
      labelEn: "Warm-Blooded Neighbor",
      badgeBg: "bg-amber-50 border-amber-300",
      badgeText: "text-amber-800",
      barColor: "bg-amberbell",
      icon: "🌟",
      descriptionTr:
        "Mahallede aktif paylaşımcı! Komşular tarafından çok seviliyor.",
      descriptionEn:
        "Active neighborhood giver! Highly appreciated by local neighbors.",
    };
  }
  return {
    id: "PILLAR",
    labelTr: "Mahalle Çınarı",
    labelEn: "Pillar of the Neighborhood",
    badgeBg: "bg-emerald-100 border-emerald-300",
    badgeText: "text-emerald-900",
    barColor: "bg-emerald-600",
    icon: "👑",
    descriptionTr:
      "Mahallenin en güvenilir ve cömert paylaşım öncülerinden biri.",
    descriptionEn:
      "One of the most trusted and generous sharing pioneers in the mahalle.",
  };
}

// Section 6.3 Prohibited Items Filter for Turkey
const PROHIBITED_KEYWORDS = [
  "ilaç",
  "antibiyotik",
  "reçete",
  "alkol",
  "rakı",
  "bira",
  "şarap",
  "votka",
  "sigara",
  "tütün",
  "elektronik sigara",
  "puff",
  "silah",
  "tabanca",
  "bıçak",
  "mermi",
  "sahte",
  "replika",
  "prescription",
  "medicine",
  "pills",
  "alcohol",
  "whiskey",
  "wine",
  "beer",
  "tobacco",
  "cigarette",
  "vape",
  "weapon",
  "gun",
  "counterfeit",
];

export function checkProhibitedContent(text: string): {
  blocked: boolean;
  keyword?: string;
} {
  const normalized = text.toLocaleLowerCase("tr-TR");
  for (const kw of PROHIBITED_KEYWORDS) {
    if (normalized.includes(kw)) {
      return { blocked: true, keyword: kw };
    }
  }
  return { blocked: false };
}

// Screen 2: AI-assisted auto-category suggestion from title/description
export function suggestCategoryFromText(
  text: string
): Exclude<CategoryId, "ALL"> | null {
  const lower = text.toLocaleLowerCase("tr-TR");
  if (
    lower.includes("bebek") ||
    lower.includes("çocuk") ||
    lower.includes("puset") ||
    lower.includes("oyuncak") ||
    lower.includes("stroller") ||
    lower.includes("baby") ||
    lower.includes("kids") ||
    lower.includes("lego")
  ) {
    return "BABY_KIDS";
  }
  if (
    lower.includes("kedi") ||
    lower.includes("köpek") ||
    lower.includes("mama") ||
    lower.includes("tırmalama") ||
    lower.includes("taşıma") ||
    lower.includes("cat") ||
    lower.includes("dog") ||
    lower.includes("pet")
  ) {
    return "PETS";
  }
  if (
    lower.includes("bitki") ||
    lower.includes("çiçek") ||
    lower.includes("saksı") ||
    lower.includes("fide") ||
    lower.includes("monstera") ||
    lower.includes("plant") ||
    lower.includes("pot")
  ) {
    return "PLANTS";
  }
  if (
    lower.includes("kitap") ||
    lower.includes("roman") ||
    lower.includes("gitar") ||
    lower.includes("puzzle") ||
    lower.includes("book") ||
    lower.includes("novel") ||
    lower.includes("hobby")
  ) {
    return "BOOKS_HOBBY";
  }
  if (
    lower.includes("acil") ||
    lower.includes("kapı önü") ||
    lower.includes("hemen") ||
    lower.includes("taşınıyoruz") ||
    lower.includes("curb") ||
    lower.includes("urgent") ||
    lower.includes("moving")
  ) {
    return "URGENT";
  }
  if (
    lower.includes("masa") ||
    lower.includes("sandalye") ||
    lower.includes("koltuk") ||
    lower.includes("lamba") ||
    lower.includes("ikea") ||
    lower.includes("mutfak") ||
    lower.includes("table") ||
    lower.includes("chair") ||
    lower.includes("shelf") ||
    lower.includes("lamp")
  ) {
    return "HOME";
  }
  return null;
}

export function formatRemainingExpiry(
  expiresAtIso: string | undefined,
  lang: Language
): string | null {
  if (!expiresAtIso) return null;
  const diffMs = new Date(expiresAtIso).getTime() - Date.now();
  if (diffMs <= 0) {
    return lang === "tr" ? "Süresi Doldu" : "Expired";
  }
  const totalMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (lang === "tr") {
    return hours > 0 ? `${hours}s ${mins}dk kaldı` : `${mins}dk kaldı`;
  }
  return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
}
