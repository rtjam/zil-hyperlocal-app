# ZiL — Hyperlocal Neighborhood Giveaway & Community App
**Phase 1 Product & Technical Blueprint (Turkey & Expat Market)**

---

## 1. Product Vision & Phase 1 Scope ("Zero-Transaction Wedge")

### 1.1 Strategic Wedge: Why Start 100% Free?
In Phase 1, **ZiL** launches strictly as a **100% free neighborhood giveaway and sharing network** ("Paylaşım & Hediyeleşme"). No prices, no bidding, no IBAN transfers, and no escrow fees.
* **Zero Friction & Zero Scams:** Removing money eliminates payment fraud, aggressive lowballing (*ölücüler*), and complex tax/escrow regulations in Turkey on Day 1.
* **High Velocity Habit Building:** Giving away outgrown baby clothes, moving-out furniture, extra books, or kitchenware creates instant goodwill and builds daily active density within a *Mahalle* (neighborhood) or *Site* (gated complex).
* **Expat + Local Bridge:** Expats moving in/out of Istanbul, Antalya, or Izmir frequently need to offload items fast without navigating Turkish classifieds. Locals love trusted neighborly sharing (*"Komşuda pişer, bize de düşer"*).

### 1.2 Core Value Proposition
* **Turkish Tagline:** *"Komşunun Ziline Bas — Paylaş, Tanış, Mahalleni Yaşat."*
* **English Tagline:** *"Ring Your Neighbor's Bell — Give, Share, Connect Locally."*

---

## 2. Brand Identity, Logo Design & UI Style Guide

### 2.1 Logo Design Specifications
The typographic styling **ZiL** (Capital `Z`, lowercase `i`, Capital `L`) is the centerpiece of the visual identity.

1. **Primary Wordmark (`ZiL`):**
   * **Font Style:** Geometric, rounded heavy sans-serif (e.g., *Plus Jakarta Sans ExtraBold*, *Nunito Black*, or custom rounded geometry).
   * **The Centerpiece (`i`):**
     * The vertical stem of the `i` is styled as a subtle pill-shaped **doorbell plate**.
     * The dot (tittle) of the `i` is an oversized, glowing **Amber Gold circular doorbell button** with a soft concentric ripple/soundwave ring around it, doubling visually as a **location pin head**.
2. **App Icon (1024x1024px):**
   * **Background:** Deep Emerald/Bosporus Teal (`#0F4C5C`) with a subtle radial gradient (`#135D70` at top-left).
   * **Foreground:** A tactile, minimalist rounded-square doorbell plate in Warm Cream (`#FAF8F5`) with a glowing Amber Brass button (`#F59E0B`) in the center and two subtle curved soundwave lines on the top-right corner.
3. **Signature Audio Branding:**
   * Custom push notification sound (`zil_chime.wav`): A warm, two-tone acoustic brass doorbell chime (*Ding-Dong!*), instantly recognizable in public spaces.

### 2.2 Color Palette
Designed to stand completely apart from Letgo (Red), Sahibinden (Yellow/Black), Getir (Purple), and Trendyol (Orange).

| Role | Color Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | **Bosporus Teal** | `#0F4C5C` | Top bars, primary headers, verified badges, structural anchors |
| **Primary Action / Accent** | **Amber Bell Gold** | `#F59E0B` | *"Zile Bas"* (Ring the Bell) CTA buttons, notification dots, active states |
| **Secondary Trust** | **Anatolian Sage** | `#10B981` | *"Komşuluk Derecesi"* (Trust thermometer), "Available" item tags, GPS verified check |
| **Background (Light)** | **Warm Plaster** | `#FAF8F5` | Main app background (softer and warmer than sterile `#FFFFFF`) |
| **Surface / Card** | **Pure White** | `#FFFFFF` | Item cards, chat bubbles, bottom sheets (with subtle `#E5E7EB` 1px borders) |
| **Text Primary** | **Charcoal Slate** | `#1F2937` | Headings, item titles, primary body text |
| **Text Secondary** | **Muted Stone** | `#6B7280` | Timestamps, distance indicators (`400m uzakta`), neighborhood subtitles |
| **Alert / Report** | **Terracotta Red** | `#EF4444` | No-show warnings, block/report actions |

### 2.3 Typography & Localization Support
* **Primary Typeface:** `Plus Jakarta Sans` or `Inter` — full support for Turkish diacritics (`ç, ğ, ı, İ, ö, ş, ü`) and Cyrillic/Latin/Arabic scripts for expats using auto-translate.
* **UI Tone of Voice:** Warm, respectful, neighborly. Never use cold e-commerce words like *"Satın Al"* (Buy) or *"Müşteri"* (Customer). Always use *"Komşu"* (Neighbor), *"Hediye"* (Gift), and *"Zile Bas"* (Ring the Bell).

---

## 3. Core Mechanics & Feature Architecture

### 3.1 Strict GPS Neighborhood Lock ("Zil Kaydı")
* Users cannot browse or claim items nationwide.
* **Polygon Mapping:** Integrate official Turkish **Mahalle** (neighborhood) boundaries + custom polygons for major **Siteler** (gated apartment complexes).
* **Radius Slider:** Users can toggle their view between:
  1. **Sitem / Sokağım** (Ultra-local: 0.5 km radius)
  2. **Mahallem** (Default: 1.5 km radius)
  3. **Yakın Çevre** (Adjacent neighborhoods: 3.0 km radius max)
* **30-Day Re-verification:** Every 30 days, the user must physically be inside their *Mahalle* polygon with phone GPS active to maintain the **"Onaylı Komşu" (Verified Neighbor)** badge and click *"Zile Bas"*.

### 3.2 The Free Giveaway Engine ("Askıda / Hediye")
Inspired by the traditional Turkish custom of *Askıda Ekmek* (paying it forward for a neighbor), every listing in Phase 1 is 100% free.
* **Anti-Hoarder Rule ("Fair Share Engine"):**
  * When a giver posts a free item, multiple neighbors can click **"Zile Bas (Talep Et)"** (Ring the Bell / Request).
  * Instead of "first-come-first-served" (which favors resellers/bots), the giver sees a clean list of interested neighbors showing:
    * Their **Komşuluk Derecesi** (Trust Temperature)
    * How many items they have **Given vs. Received** in the last 30 days
    * A short 1-sentence note (e.g., *"Yeni taşındık, balkonumuz için çok seviniriz!"* / *"We just moved in, would love this for our balcony!"*)
  * **Weekly Claim Cap (Optional/Soft Limit):** New users at 36.5°C can claim up to 3 free items per week; giving away 1 item immediately unlocks unlimited claims.

### 3.3 "Komşuluk Derecesi" (Neighborliness Temperature)
Adapted from Danggeun’s Manner Temperature:
* **Starting Score:** Every user begins at **36.5°C** (normal human body temperature).
* **Temperature Tiers:**
  * `below 34.0°C` — **Soğuk Komşu** (Cold Neighbor - Warning state, penalized for ghosting/no-shows)
  * `36.5°C – 39.9°C` — **İyi Komşu** (Good Neighbor - Default Teal badge)
  * `40.0°C – 49.9°C` — **Sıcakkanlı Komşu** (Warm-Blooded Neighbor - Amber Gold badge)
  * `50.0°C – 99.0°C` — **Mahalle Çınarı** (Pillar of the Neighborhood - Emerald Crown badge)
* **How Temperature Rises:**
  * Giving away an item successfully: **+0.5°C**
  * Receiving positive 3-tap post-meetup feedback (On time, Polite, Easy pickup): **+0.2°C to +0.4°C**
* **How Temperature Drops:**
  * Confirmed no-show at a scheduled meetup: **-1.5°C**
  * Rudeness or asking to sell/ship a free item: **-2.0°C**

### 3.4 Built-In Auto-Translation (Expat-Friendly)
* Every listing description and chat message includes a subtle **"🌐 Çevir / Translate"** toggle powered by lightweight on-device or cloud translation API (TR ↔ EN / RU / DE / AR).
* The interface switches seamlessly between **Turkish** and **English** based on device locale.

---

## 4. Screen-by-Screen UI/UX Blueprint

### Tab 1: Kapı Önü (Home Feed — Free Giveaways)
* **Top Header:**
  * Left: Dropdown selector showing verified neighborhood (e.g., `📍 Moda, Kadıköy (1.5 km)`).
  * Right: Search icon (`🔍`), Category Filter icon, Notification Bell (`🔔`).
* **Category Filter Pills (Horizontal Scroll):**
  * `Tümü (All)` | `⚡ Hemen Al-Götür (Curb Alert / Urgent)` | `👶 Bebek & Çocuk (Baby/Kids)` | `🛋️ Ev & Mobilya (Home)` | `📚 Kitap & Hobi` | `🐾 Evcil Hayvan (Pets)` | `🌱 Bitki & Fideler (Plants)`
* **Item Card Layout (2-Column Grid or Rich List View):**
  * **Photo:** Square (1:1) rounded image with status badge (`🟢 Müsait / Available`, `🟡 Sözleşildi / Reserved`, `⚪ Verildi / Given`).
  * **Title:** 1-line truncated bold text.
  * **Location & Time:** e.g., `Caferağa • 350m • 12 dk önce`.
  * **Giver Trust Pill:** Mini badge showing `🌡️ 38.2°C`.
  * **Ring Counter:** `🔔 3 komşu zile bastı` (3 neighbors rang the bell).
* **Floating Action Button (FAB):**
  * Bottom-right Amber Gold pill button: **`+ Hediye Ver` (+ Give Free)**.

### Screen 2: Post an Item Flow ("30-Second Giveaway")
1. **Snap 1–5 Photos:** Camera/Gallery picker.
2. **Quick Title & Category:** AI-assisted auto-category suggestion from photo.
3. **Pickup Preference (Crucial for Turkey Safety):**
   * `🏢 Site Güvenliğinden Teslim` (Leave at Gated Complex Security Desk)
   * `☕ Güvenli Noktada Buluşma` (Meet at a pre-verified public spot: local metro entrance, cafe, park)
   * `🚪 Kapı Önünden Al-Götür` (Porch/Building entrance pickup)
4. **Condition Tag:** `Yeni Gibi (Like New)` | `İyi Durumda (Good)` | `İş Görür (Functional)`.
5. **Submit Button:** **"Mahallede Paylaş" (Share with Neighborhood)**.

### Screen 3: Item Detail & "Zile Bas" Action
* Swipeable photo carousel.
* **Giver Profile Bar:** Avatar, First Name + Last Initial, Verified Mahalle name, **Komşuluk Derecesi** thermometer bar (`39.4°C`), and a `Given: 12 | Received: 4` counter.
* **Safe Meetup Map Preview:** Shows a **fuzzy 300m circle** (never the exact apartment pin) OR the chosen **Güvenli Buluşma Noktası** (Safe Meetup Spot pin, e.g., *Kadıköy Boğa Heykeli* or *Site A-Blok Güvenlik*).
* **Bottom Sticky Bar:**
  * Heart icon (Save) + Primary Amber Gold Button: **🔔 Zile Bas (İlgileniyorum)** (*Ring the Bell — I'm Interested*).
  * Tapping opens a quick modal with 3 one-tap polite icebreakers:
    * *"Merhaba komşu! Hala müsaitse bugün gelip alabilirim."* (Hi neighbor! If still available, I can pick it up today.)
    * *"Merhaba! Ne zaman ve nereden teslim almak sizin için uygun olur?"* (Hi! When and where works best for pickup?)

### Tab 2: Apartman Panosu (Hyperlocal Community Feed)
* Text & photo micro-forum strictly locked to the same GPS radius:
  * `🔍 Kayıp & Buluntu` (Lost & Found pets/keys)
  * `🛠️ Usta & Tavsiye` (Trusted local plumber, electrician, cleaner recommendations)
  * `🤝 Ödünç İste` (Borrow a drill, ladder, or cat carrier for 2 hours)
  * `☕ Mahalle Sohbeti` (Local announcements, street events)

### Tab 3: Zil Sesi (In-App Chat & Meetup Coordinator)
* Real-time chat list between Giver and Receiver.
* **No Phone Number Sharing Required:** Keep users safe inside the app.
* **1-Tap Action Chips inside Chat:**
  * `📍 Güvenli Nokta Seç` (Share a Safe Meetup Pin)
  * `⏰ Buluşma Saati Ayarla` (Set Pickup Time — sends a 30-min reminder to both)
  * `🤝 Sözleşildi İşaretle` (Mark Item as Reserved for this Neighbor)
  * `🎉 Teslim Edildi (Hediye Tamam)` (Mark as Given — triggers the 3-tap Temperature review)

### Tab 4: Komşu Kartım (My Neighbor Profile)
* User avatar, Verified Mahalle badge, and interactive **Komşuluk Derecesi** gauge.
* **Impact Badges:**
  * `🌱 Sıfır Atık Kahramanı` (Zero-Waste Hero: 5+ items saved from landfill)
  * `🌍 Yabancı Dostu` (Expat Friendly: Completed exchanges across languages)
  * `⚡ Hızlı Komşu` (Fast Responder)

---

## 5. Recommended Tech Stack & Architecture

Designed for rapid MVP development, low cloud overhead, and high geospatial accuracy.

```
+-------------------------------------------------------------------+
|                   MOBILE CLIENT (iOS & Android)                   |
|        Flutter (Dart) OR React Native (Expo + TypeScript)         |
|   - Mapbox SDK / Google Maps SDK (Mahalle Polygons & Safe Pins)   |
|   - Localizations: Turkish (tr-TR) & English (en-US)              |
+---------------------------------+---------------------------------+
                                  | REST / GraphQL + WebSockets
                                  v
+-------------------------------------------------------------------+
|                   BACKEND & REAL-TIME SERVICES                    |
|               Supabase (PostgreSQL + PostGIS)                     |
|   - Auth: Turkish SMS OTP (Netgsm / Twilio) + Apple / Google      |
|   - Database: PostgreSQL with PostGIS extension for geofencing    |
|   - Realtime: Supabase Realtime / Firebase Cloud Messaging (FCM)  |
|   - Storage: Cloudflare R2 / AWS S3 (WebP image compression)      |
+-------------------------------------------------------------------+
```

### 5.1 Core Database Schema (PostgreSQL + PostGIS)

```sql
-- Enable PostGIS for hyperlocal neighborhood boundary & radius queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Neighborhoods (Mahalle & Major Siteler Polygons)
CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_tr VARCHAR(120) NOT NULL,          -- e.g., 'Caferağa Mahallesi'
    district VARCHAR(120) NOT NULL,         -- e.g., 'Kadıköy'
    city VARCHAR(80) NOT NULL,              -- e.g., 'İstanbul'
    boundary GEOMETRY(Polygon, 4326),       -- Official Mahalle polygon
    center_point GEOMETRY(Point, 4326)
);

-- 2. Users (Komşular)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_hash VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    avatar_url TEXT,
    preferred_lang VARCHAR(5) DEFAULT 'tr', -- 'tr', 'en', 'ru'
    primary_neighborhood_id UUID REFERENCES neighborhoods(id),
    last_gps_verified_at TIMESTAMP WITH TIME ZONE,
    manner_temp NUMERIC(4,1) DEFAULT 36.5 CHECK (manner_temp BETWEEN 0.0 AND 99.9),
    items_given_count INT DEFAULT 0,
    items_received_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Free Giveaway Listings (Hediyeler)
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    neighborhood_id UUID REFERENCES neighborhoods(id),
    title VARCHAR(140) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    pickup_type VARCHAR(40) NOT NULL,       -- 'SITE_SECURITY', 'SAFE_SPOT', 'DOORSTEP'
    fuzzy_location GEOMETRY(Point, 4326) NOT NULL, -- Randomized within 250m for privacy
    safe_spot_name VARCHAR(140),
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RESERVED', 'GIVEN'
    reserved_for_user_id UUID REFERENCES users(id),
    ring_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial Index for instant <50ms hyperlocal feed queries
CREATE INDEX idx_listings_location ON listings USING GIST (fuzzy_location);
```

### 5.2 Hyperlocal Radius Query (PostGIS)
To fetch available free items within a user's selected radius (e.g., 1,500 meters):

```sql
SELECT id, title, category, pickup_type, status, ring_count,
       ST_Distance(fuzzy_location::geography, ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326)::geography) AS distance_meters
FROM listings
WHERE status != 'GIVEN'
  AND ST_DWithin(
        fuzzy_location::geography,
        ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326)::geography,
        1500 -- 1.5 km radius
      )
ORDER BY created_at DESC
LIMIT 40;
```

---

## 6. Legal, Privacy & Safety Checklist for Turkey

1. **KVKK Compliance (Kişisel Verilerin Korunması Kanunu):**
   * **Location Privacy:** Never store or display a user's exact home GPS coordinates in public API responses. Fuzz coordinates by 150–300 meters before saving to `listings.fuzzy_location`.
   * **Explicit Consent:** Include clear KVKK consent checkboxes during onboarding (Turkish & English).
2. **SMS OTP Verification:**
   * Require a valid phone number on signup to prevent multi-account hoarding and bots. Use a local Turkish SMS gateway (e.g., *Netgsm* or *İletimerkezi*) for low cost and high delivery speed in Turkey.
3. **Prohibited Items Filter:**
   * Automatically block listings containing regulated items in Turkey: prescription medication (*ilaç*), tobacco/alcohol, weapons, counterfeit goods, or live animal sales.

---

## 7. Step-by-Step Build Roadmap (8-Week MVP)

* **Weeks 1–2: Foundation & Design System**
  * Finalize the **ZiL** logo, custom *"Ding-Dong"* notification audio, and Figma component library in Bosporus Teal & Amber Gold.
  * Set up Supabase project, PostGIS extensions, and import Istanbul/Antalya/Izmir *Mahalle* GeoJSON boundary polygons.
* **Weeks 3–4: Auth, GPS Verification & Listing Engine**
  * Build SMS OTP login + GPS *Mahalle* verification screen.
  * Build the 30-second "Give Free Item" camera flow with automatic WebP image compression and fuzzy coordinate offsetting.
* **Weeks 5–6: "Zile Bas" Request Flow, Chat & Auto-Translate**
  * Build real-time chat with Safe Meetup Spot selector, 1-tap icebreakers, and TR/EN translation toggle.
  * Implement the Giver's applicant selector showing each requester's *Komşuluk Derecesi* and Give/Receive ratio.
* **Weeks 7–8: Trust Thermometer, Polish & Hyperlocal Seed Launch**
  * Implement the post-handoff 3-tap review flow that updates `manner_temp`.
  * Closed beta launch in **1–2 high-density pilot zones** (e.g., **Kadıköy/Moda** or **Beşiktaş** in Istanbul, or **Konyaaltı/Lara** in Antalya where both locals and expats live densely).