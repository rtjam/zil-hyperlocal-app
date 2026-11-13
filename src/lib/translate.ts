// Lightweight TR <-> EN Auto-Translation Engine for Expat & Local Bridge
// Uses cloud translation API with instant deterministic dictionary/phrase fallback

const TR_TO_EN_PHRASES: Record<string, string> = {
  "temiz durumda, ihtiyacı olan bir komşumuza hediye.":
    "Clean condition, free gift for a neighbor who needs it.",
  "merhaba komşu! hala müsaitse bugün gelip alabilirim.":
    "Hi neighbor! If still available, I can pick it up today.",
  "merhaba! ne zaman ve nereden teslim almak sizin için uygun olur?":
    "Hi! When and where works best for pickup?",
  "yeni taşındık, evimiz için çok seviniriz! güvenlikten teslim alabilirim.":
    "We just moved in, would love this! Can pick up from security.",
};

const WORD_GLOSSARY_TR_EN: [RegExp, string][] = [
  [/\bmerhaba\b/gi, "Hi"],
  [/\bkomşular\b/gi, "neighbors"],
  [/\bkomşu\b/gi, "neighbor"],
  [/\bhediye\b/gi, "free gift"],
  [/\bücretsiz\b/gi, "free"],
  [/\bmasif ahşap\b/gi, "solid wood"],
  [/\bbalkon sandalyesi\b/gi, "balcony chair"],
  [/\bsandalye\b/gi, "chair"],
  [/\bmasa\b/gi, "table"],
  [/\bkoltuk\b/gi, "armchair"],
  [/\bbebek\b/gi, "baby"],
  [/\boyuncak\b/gi, "toy"],
  [/\bkitap\b/gi, "book"],
  [/\bbitki\b/gi, "plant"],
  [/\bsaksı\b/gi, "pot"],
  [/\bkedi\b/gi, "cat"],
  [/\bköpek\b/gi, "dog"],
  [/\bödünç\b/gi, "borrow"],
  [/\b2 saatliğine\b/gi, "for 2 hours"],
  [/\bsite güvenliğinden\b/gi, "from site security desk"],
  [/\bgüvenlikten\b/gi, "from security"],
  [/\bkapı önünden\b/gi, "from doorstep"],
  [/\btemiz durumda\b/gi, "in clean condition"],
  [/\byeni gibi\b/gi, "like new"],
  [/\badet\b/gi, "pcs"],
  [/\bseti\b/gi, "set"],
  [/\bteşekkürler\b/gi, "thank you"],
  [/\bbugün\b/gi, "today"],
  [/\bakşam\b/gi, "this evening"],
  [/\bmüsait\b/gi, "available"],
];

export async function autoTranslateText(
  text: string,
  sourceLang: "tr" | "en",
  targetLang: "tr" | "en"
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || sourceLang === targetLang) return trimmed;

  const lower = trimmed.toLocaleLowerCase("tr-TR");
  if (sourceLang === "tr" && TR_TO_EN_PHRASES[lower]) {
    return TR_TO_EN_PHRASES[lower];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=${sourceLang}|${targetLang}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (
        translated &&
        typeof translated === "string" &&
        !translated.includes("MYMEMORY WARNING")
      ) {
        return translated;
      }
    }
  } catch {
    // Fallback to local glossary below
  }

  if (sourceLang === "tr" && targetLang === "en") {
    let result = trimmed;
    for (const [regex, replacement] of WORD_GLOSSARY_TR_EN) {
      result = result.replace(regex, replacement);
    }
    return result === trimmed ? `[EN] ${trimmed}` : result;
  }

  return trimmed;
}
