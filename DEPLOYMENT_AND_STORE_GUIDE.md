# ZiL — Complete Deployment & App Store / Play Store Guide

This guide covers step-by-step instructions to deploy **ZiL** (`tr.com.zil.app`) to **Supabase (PostgreSQL + PostGIS)**, **Vercel**, **Google Play Store (Android)**, and **Apple App Store (iOS)**.

---

## 1. Local Development & Testing

```powershell
# 1. Install dependencies
npm install

# 2. Run local development server (http://localhost:3000)
npm run dev

# 3. Verify production build
npm run build
```

> **Note:** Out of the box, ZiL uses a serverless-safe local JSON database (`data/zil-db.json` with `/tmp/zil-db.json` fallback in `src/lib/db.ts`), so you can test every feature locally or on Vercel immediately even before connecting external API keys.

---

## 2. Supabase (PostgreSQL + PostGIS) & Social Auth Setup

### 2.1 Create Project & Run PostGIS Schema
1. Go to **[Supabase Dashboard](https://supabase.com/dashboard)** and create a new project (choose **Frankfurt `eu-central-1`** for lowest latency to Turkey).
2. Open **SQL Editor → New Query**.
3. Copy and paste the entire contents of [`supabase/migrations/001_zil_complete_schema.sql`](./supabase/migrations/001_zil_complete_schema.sql) and click **Run**.
   * This enables the `postgis` extension and creates all 7 tables (`neighborhoods`, `users`, `listings`, `bell_rings`, `board_posts`, `chat_messages`, `temperature_reviews`) plus the `get_hyperlocal_listings` spatial radius function.
4. Go to **Project Settings → API** and copy:
   * `Project URL` (`NEXT_PUBLIC_SUPABASE_URL`)
   * `anon public` key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 2.2 Configure Social OAuth Providers (Google, Apple, Instagram/Facebook)
In **Supabase Dashboard → Authentication → Providers**:

1. **Google OAuth:**
   * Create an OAuth 2.0 Client ID in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   * Add Authorized Redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   * Paste `Client ID` and `Client Secret` into Supabase → Providers → Google.
2. **Sign in with Apple (Mandatory for iOS App Store):**
   * In [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list/serviceId), create a **Services ID** (`tr.com.zil.app.auth`), enable **Sign in with Apple**, and add Return URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
   * Paste the Services ID and Private Key into Supabase → Providers → Apple.
3. **Facebook / Instagram OAuth:**
   * Create an app at [Meta for Developers](https://developers.facebook.com/), enable **Facebook Login**, add Valid OAuth Redirect URI `https://<your-project-ref>.supabase.co/auth/v1/callback`, and paste App ID & Secret into Supabase → Providers → Facebook.
4. **URL Configuration:**
   * In **Supabase → Authentication → URL Configuration**, set:
     * **Site URL:** `https://your-production-domain.com`
     * **Redirect URLs:** `https://your-production-domain.com/auth/callback`

### 2.3 Turkish SMS OTP Gateway (`+90` Verification)
* For Turkey SMS OTP delivery, configure **Netgsm** (`NETGSM_USERCODE`, `NETGSM_PASSWORD`) or **Twilio** in Supabase Phone Auth (`Authentication → Providers → Phone`).

---

## 3. Deploying to Vercel (Production HTTPS & Mobile PWA)

1. Push this project to a GitHub repository:
   ```powershell
   git init
   git add .
   git commit -m "Initial ZiL Karrot-style mobile app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/zil.git
   git push -u origin main
   ```
2. Go to **[Vercel](https://vercel.com/new)** and import your GitHub repository.
3. Under **Environment Variables**, add (optional for demo, required for live Supabase):
   * `NEXT_PUBLIC_SUPABASE_URL` = `https://<your-project-ref>.supabase.co`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<your-anon-key>`
   * `CAPACITOR_SERVER_URL` = `https://<your-vercel-domain>.vercel.app`
4. Click **Deploy**.
5. **Instant Mobile PWA Installation:**
   * Open your deployed Vercel URL on **iPhone (Safari → Share → Add to Home Screen)** or **Android (Chrome → Install App)**.
   * Thanks to [`public/manifest.json`](./public/manifest.json) and [`public/icon.svg`](./public/icon.svg), ZiL launches full-screen (`standalone`) without browser bars.

---

## 4. Packaging for Google Play Store & Apple App Store (Capacitor)

The project includes [`capacitor.config.ts`](./capacitor.config.ts) pre-configured with App ID `tr.com.zil.app` and helper scripts in [`package.json`](./package.json).

### 4.1 Install Native Capacitor Packages
Run once in your project root:
```powershell
npm install @capacitor/core @capacitor/geolocation @capacitor/camera @capacitor/push-notifications
npm install -D @capacitor/cli @capacitor/android @capacitor/ios
```

Set your production HTTPS URL before syncing:
```powershell
$env:CAPACITOR_SERVER_URL="https://your-vercel-domain.vercel.app"
npm run cap:add:android
npm run cap:add:ios
npm run cap:sync
```

---

## 5. Publishing to Google Play Store (Android)

1. **Developer Account:** Register at [Google Play Console](https://play.google.com/console) ($25 one-time fee).
2. **Open Project in Android Studio:**
   ```powershell
   npm run cap:android
   ```
3. **Verify Permissions in `android/app/src/main/AndroidManifest.xml`:**
   Ensure these lines are present inside `<manifest>`:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.CAMERA" />
   ```
4. **Build Signed `.aab` (Android App Bundle):**
   * In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**.
   * Create a keystore file (`.jks`) and save it safely.
5. **Upload to Google Play Console:**
   * Create a new app (`ZiL — Komşunun Ziline Bas`, Default Language: `tr-TR`).
   * Complete the **Data Safety** form (declare approximate location 250m fuzzing & optional photos).
   * Upload `app-release.aab` under **Production** (or **Closed Testing** for your Kadıköy/Moda pilot).

> **Fast Alternative for Android (`PWABuilder`):** You can also paste your live Vercel HTTPS URL into **[PWABuilder.com](https://www.pwabuilder.com/)** → click **Package for Stores → Android** to download a signed `.aab` bundle directly.

---

## 6. Publishing to Apple App Store (iOS)

1. **Developer Account:** Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year).
2. **Open Project in Xcode** (requires macOS or a cloud CI runner like **Codemagic**):
   ```bash
   npm run cap:ios
   ```
3. **Add Mandatory Privacy Strings in `ios/App/App/Info.plist`:**
   ```xml
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>ZiL, yalnızca kendi mahallenizdeki ücretsiz paylaşımları göstermek için konumunuzu doğrular.</string>
   <key>NSCameraUsageDescription</key>
   <string>Komşularınıza hediye edeceğiniz eşyanın fotoğrafını çekmek için kamera erişimi gerekir.</string>
   <key>NSPhotoLibraryUsageDescription</key>
   <string>Paylaşacağınız eşyanın fotoğrafını galeriden seçmek için izin gerekir.</string>
   ```
4. **Archive & Upload:**
   * Select **Any iOS Device (arm64)** in Xcode.
   * Click **Product → Archive → Distribute App → App Store Connect**.

---

## 7. App Store & Google Play Review Notes (Copy-Paste Template)

When submitting to **App Store Connect** or **Google Play Console**, paste these credentials into the **App Review Information / Notes** box so reviewers outside Turkey can test inside the Istanbul `Caferağa & Moda` neighborhood polygon:

```text
Demo Reviewer Instructions for ZiL:
1. ZiL is a 100% free hyperlocal neighborhood giveaway app (zero payments, zero transactions).
2. To test onboarding & SMS verification outside Turkey:
   - Tap the ZiL doorbell icon at top-right (or go to "Komşu Kartım" -> "Giriş & Kayıt Ekranı").
   - Select "Caferağa & Moda (Kadıköy, İstanbul)" on Step 2 to simulate being inside the neighborhood polygon.
   - On Step 3, use Test Phone: +90 532 418 92 10 and click "SMS Gönder" (Test OTP Code: 482910).
3. Compliance Features Location:
   - Sign in with Apple / Google / Instagram: Included on Onboarding Step 1.
   - Report (-1.5°C / -2.0°C) & Block User (Guideline 1.2): Open "Zil Sesi" (Chats) -> open any conversation -> tap the red Flag icon (top-right).
   - Delete Account (Guideline 5.1.1v): Open "Komşu Kartım" (Profile) -> scroll to "Hesabımı ve Verilerimi Sil (KVKK)".
```
