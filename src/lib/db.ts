import fs from "fs";
import os from "os";
import path from "path";
import { ZilDatabase } from "./types";

const LOCAL_DB_DIR = path.join(process.cwd(), "data");
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, "zil-db.json");
const TMP_DB_FILE = path.join(os.tmpdir(), "zil-db.json");

export function getInitialSeedData(): ZilDatabase {
  const now = new Date();
  const inTwoHours = new Date(now.getTime() + 142 * 60 * 1000).toISOString();
  const inNinetyMins = new Date(now.getTime() + 95 * 60 * 1000).toISOString();

  return {
    activeUserId: "user-defne",
    neighborhoods: [
      {
        id: "nb-moda",
        nameTr: "Caferağa & Moda",
        nameEn: "Caferaga & Moda",
        district: "Kadıköy",
        city: "İstanbul",
        centerLat: 40.9848,
        centerLng: 29.0254,
        safeSpots: [
          "Moda İskelesi Meydanı",
          "Kadıköy Boğa Heykeli Önü",
          "Yoğurtçu Parkı Ana Girişi",
          "Moda Palas Site A-Blok Güvenlik",
          "Caferağa Spor Salonu Önü",
        ],
      },
      {
        id: "nb-bebek",
        nameTr: "Bebek & Arnavutköy",
        nameEn: "Bebek & Arnavutkoy",
        district: "Beşiktaş",
        city: "İstanbul",
        centerLat: 41.0772,
        centerLng: 29.0436,
        safeSpots: [
          "Bebek Parkı İskele Girişi",
          "Arnavutköy İskelesi Meydanı",
          "Bebekoy Site Güvenlik Danışma",
        ],
      },
      {
        id: "nb-konyaalti",
        nameTr: "Liman & Hurma",
        nameEn: "Liman & Hurma",
        district: "Konyaaltı",
        city: "Antalya",
        centerLat: 36.8529,
        centerLng: 30.6126,
        safeSpots: [
          "Konyaaltı Sahil Yaşam Parkı",
          "Boğaçayı Köprüsü Meydanı",
          "Gürsu Rezidans Site Güvenliği",
        ],
      },
    ],
    users: [
      {
        id: "user-defne",
        displayName: "Defne K.",
        phoneMasked: "+90 532 ••• •• 84",
        email: "defne.k@gmail.com",
        authProvider: "google",
        socialHandle: "@defne.moda",
        connectedProviders: ["google", "instagram", "phone"],
        roleLabelTr: "Sıcakkanlı Komşu • Moda",
        roleLabelEn: "Warm-Blooded Neighbor • Moda",
        avatarColor: "bg-bosporus text-white",
        initials: "DK",
        preferredLang: "tr",
        neighborhoodId: "nb-moda",
        lastGpsVerifiedAt: new Date(
          now.getTime() - 2 * 24 * 3600 * 1000
        ).toISOString(),
        mannerTemp: 42.8,
        itemsGivenCount: 9,
        itemsReceivedCount: 3,
        weeklyClaimsUsed: 1,
        badges: ["ZERO_WASTE_HERO", "EXPAT_FRIENDLY", "FAST_RESPONDER"],
      },
      {
        id: "user-alexey",
        displayName: "Alexey M.",
        phoneMasked: "+90 535 ••• •• 19",
        email: "alexey.m@icloud.com",
        authProvider: "apple",
        socialHandle: "@alexey.ist",
        connectedProviders: ["apple", "phone"],
        roleLabelTr: "Expat Komşu • Bademaltı Sk.",
        roleLabelEn: "Expat Neighbor • Bademalti St.",
        avatarColor: "bg-amber-600 text-white",
        initials: "AM",
        preferredLang: "en",
        neighborhoodId: "nb-moda",
        lastGpsVerifiedAt: new Date(
          now.getTime() - 5 * 24 * 3600 * 1000
        ).toISOString(),
        mannerTemp: 38.9,
        itemsGivenCount: 6,
        itemsReceivedCount: 2,
        weeklyClaimsUsed: 1,
        badges: ["EXPAT_FRIENDLY", "FAST_RESPONDER"],
      },
      {
        id: "user-mert",
        displayName: "Mert T.",
        phoneMasked: "+90 542 ••• •• 07",
        email: "mert.t@gmail.com",
        authProvider: "google",
        socialHandle: "@mert_kadikoy",
        connectedProviders: ["google", "facebook", "phone"],
        roleLabelTr: "Mahalle Çınarı • Yoğurtçu",
        roleLabelEn: "Pillar of the Mahalle • Yogurtcu",
        avatarColor: "bg-emerald-700 text-white",
        initials: "MT",
        preferredLang: "tr",
        neighborhoodId: "nb-moda",
        lastGpsVerifiedAt: new Date(
          now.getTime() - 1 * 24 * 3600 * 1000
        ).toISOString(),
        mannerTemp: 52.4,
        itemsGivenCount: 24,
        itemsReceivedCount: 5,
        weeklyClaimsUsed: 0,
        badges: ["ZERO_WASTE_HERO", "EXPAT_FRIENDLY", "FAST_RESPONDER"],
      },
      {
        id: "user-zeynep",
        displayName: "Zeynep A.",
        phoneMasked: "+90 530 ••• •• 61",
        authProvider: "instagram",
        socialHandle: "@zeynep.bahariye",
        connectedProviders: ["instagram", "phone"],
        roleLabelTr: "Yeni Komşu • Bahariye",
        roleLabelEn: "New Neighbor • Bahariye",
        avatarColor: "bg-teal-600 text-white",
        initials: "ZA",
        preferredLang: "tr",
        neighborhoodId: "nb-moda",
        lastGpsVerifiedAt: new Date(
          now.getTime() - 3 * 24 * 3600 * 1000
        ).toISOString(),
        mannerTemp: 36.5,
        itemsGivenCount: 0,
        itemsReceivedCount: 2,
        weeklyClaimsUsed: 2,
        badges: [],
      },
    ],
    listings: [
      {
        id: "lst-ikea-chair",
        giverId: "user-defne",
        neighborhoodId: "nb-moda",
        titleTr: "IKEA Poäng Tekli Koltuk & Bej Minder",
        titleEn: "IKEA Poäng Armchair & Beige Cushion",
        descriptionTr:
          "Salonumuzu yenilediğimiz için çok sevdiğimiz Poäng koltuğu bir komşumuza hediye etmek istiyoruz. Kılıfı yeni yıkandı, lekesizdir. Sitemizin güvenliğinden teslim alabilirsiniz.",
        descriptionEn:
          "We redecorated our living room and would love to gift our beloved Poäng armchair to a neighbor. Cover is freshly washed and spotless. Pickup from our gated complex security desk.",
        photoUrl:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80",
        photoUrls: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80",
        ],
        category: "HOME",
        conditionTag: "LIKE_NEW",
        pickupType: "SITE_SECURITY",
        distanceMeters: 180,
        subAreaName: "Caferağa • Moda Palas",
        safeSpotName: "Moda Palas Site A-Blok Güvenlik",
        fuzzyLatOffset: 44,
        fuzzyLngOffset: 48,
        status: "AVAILABLE",
        createdAt: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
        minutesAgo: 18,
      },
      {
        id: "lst-espresso",
        giverId: "user-alexey",
        neighborhoodId: "nb-moda",
        titleTr: "De'Longhi Filtre Kahve Makinesi & Cam Karaf",
        titleEn: "De'Longhi Drip Coffee Maker & Glass Carafe",
        descriptionTr:
          "Lizbon'a taşınıyoruz! Kahve makinesi sorunsuz çalışıyor, yanında 1 paket kağıt filtre de hediye. Moda İskelesi meydanında elden teslim edebilirim.",
        descriptionEn:
          "Moving out to Lisbon next week! Works great, includes an extra pack of paper filters. Happy to hand it over at Moda Ferry Square.",
        photoUrl:
          "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=80",
        category: "URGENT",
        conditionTag: "GOOD",
        pickupType: "SAFE_SPOT",
        distanceMeters: 350,
        subAreaName: "Moda Caddesi",
        safeSpotName: "Moda İskelesi Meydanı",
        fuzzyLatOffset: 62,
        fuzzyLngOffset: 34,
        status: "AVAILABLE",
        expiresAt: inTwoHours,
        createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
        minutesAgo: 25,
      },
      {
        id: "lst-monstera",
        giverId: "user-mert",
        neighborhoodId: "nb-moda",
        titleTr: "Köklendirilmiş Deve Tabanı (Monstera) & Toprak Saksı",
        titleEn: "Rooted Monstera Deliciosa Cutting & Terracotta Pot",
        descriptionTr:
          "Balkonumdaki ana bitkiden ayırdığım sağlıklı, 4 yapraklı Monstera. Toprak saksısıyla birlikte bitki sever bir komşuya hediye.",
        descriptionEn:
          "Healthy 4-leaf Monstera propagated from my balcony mother plant. Gifted together with its terracotta pot to a plant-loving neighbor.",
        photoUrl:
          "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80",
        category: "PLANTS",
        conditionTag: "LIKE_NEW",
        pickupType: "SAFE_SPOT",
        distanceMeters: 420,
        subAreaName: "Yoğurtçu Parkı Yanı",
        safeSpotName: "Yoğurtçu Parkı Ana Girişi",
        fuzzyLatOffset: 30,
        fuzzyLngOffset: 65,
        status: "AVAILABLE",
        createdAt: new Date(now.getTime() - 42 * 60 * 1000).toISOString(),
        minutesAgo: 42,
      },
      {
        id: "lst-baby-stroller",
        giverId: "user-mert",
        neighborhoodId: "nb-moda",
        titleTr: "Chicco Katlanır Bebek Puseti & Yağmurluk",
        titleEn: "Chicco Foldable Baby Stroller & Rain Cover",
        descriptionTr:
          "Kızımız büyüdüğü için artık kullanmıyoruz. Tekerlekleri ve freni sağlam, temiz durumda. İhtiyacı olan yeni aileye şimdiden hayırlı olsun.",
        descriptionEn:
          "Our daughter outgrew it. Wheels and brakes are sturdy and clean. Wishing all the best to a neighborhood family who needs it!",
        photoUrl:
          "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
        category: "BABY_KIDS",
        conditionTag: "GOOD",
        pickupType: "SITE_SECURITY",
        distanceMeters: 890,
        subAreaName: "Bahariye • Dr. Esat Işık",
        safeSpotName: "Moda Palas Site A-Blok Güvenlik",
        fuzzyLatOffset: 24,
        fuzzyLngOffset: 28,
        status: "RESERVED",
        reservedForUserId: "user-zeynep",
        securityPickupCode: "ZİL-4821",
        scheduledPickupTime: "Bugün 18:30",
        createdAt: new Date(now.getTime() - 95 * 60 * 1000).toISOString(),
        minutesAgo: 95,
      },
      {
        id: "lst-books-expat",
        giverId: "user-alexey",
        neighborhoodId: "nb-moda",
        titleTr: "8 Adet İngilizce & Türkçe Roman Seti (Orhan Pamuk, Elif Şafak)",
        titleEn: "Set of 8 English & Turkish Novels (Pamuk, Shafak, Penguin)",
        descriptionTr:
          "Türkçe öğrenirken okuduğum iki dilli romanlar ve Penguin klasikleri. Kahve eşliğinde Kadıköy Boğa Heykeli önünde teslim edebilirim.",
        descriptionEn:
          "Bilingual novels and Penguin classics I read while learning Turkish. Can hand over near Kadikoy Bull Statue.",
        photoUrl:
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
        category: "BOOKS_HOBBY",
        conditionTag: "LIKE_NEW",
        pickupType: "SAFE_SPOT",
        distanceMeters: 1250,
        subAreaName: "Bahariye • Altıyol",
        safeSpotName: "Kadıköy Boğa Heykeli Önü",
        fuzzyLatOffset: 76,
        fuzzyLngOffset: 72,
        status: "AVAILABLE",
        createdAt: new Date(now.getTime() - 140 * 60 * 1000).toISOString(),
        minutesAgo: 140,
      },
      {
        id: "lst-cat-tree",
        giverId: "user-defne",
        neighborhoodId: "nb-moda",
        titleTr: "3 Katlı Kedi Tırmalama Ağacı & Taşıma Çantası",
        titleEn: "3-Tier Cat Scratching Tree & Hard Pet Carrier",
        descriptionTr:
          "Kedimiz için daha büyük bir kule aldık. Yanında az kullanılmış havayolu onaylı kedi taşıma çantası da var. Kapı önünden hemen al-götür!",
        descriptionEn:
          "Bought a taller tower for our cat. Also includes a lightly used airline-approved carrier. Curbside doorstep pickup!",
        photoUrl:
          "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=900&q=80",
        category: "PETS",
        conditionTag: "GOOD",
        pickupType: "DOORSTEP",
        distanceMeters: 2150,
        subAreaName: "Fenerbahçe • Kalamış Sınırı",
        safeSpotName: "Caferağa Spor Salonu Önü",
        fuzzyLatOffset: 84,
        fuzzyLngOffset: 22,
        status: "AVAILABLE",
        expiresAt: inNinetyMins,
        createdAt: new Date(now.getTime() - 50 * 60 * 1000).toISOString(),
        minutesAgo: 50,
      },
    ],
    bellRings: [
      {
        id: "ring-1",
        listingId: "lst-ikea-chair",
        requesterId: "user-alexey",
        noteTr:
          "Yeni taşındık, çalışma köşemiz için çok seviniriz! Bugün 17:00 gibi güvenlikten alabilirim.",
        noteEn:
          "We just moved in, would love this for our reading corner! Can pick up from security around 17:00 today.",
        originalLang: "en",
        status: "PENDING",
        createdAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: "ring-2",
        listingId: "lst-ikea-chair",
        requesterId: "user-mert",
        noteTr:
          "Merhaba Defne komşu! Balkon okuma köşemiz için harika olur, ne zaman uygun olursanız alabilirim.",
        noteEn:
          "Hi neighbor Defne! Would be wonderful for our balcony reading nook, can pick up whenever suits you.",
        originalLang: "tr",
        status: "PENDING",
        createdAt: new Date(now.getTime() - 9 * 60 * 1000).toISOString(),
      },
      {
        id: "ring-3",
        listingId: "lst-ikea-chair",
        requesterId: "user-zeynep",
        noteTr:
          "Öğrenci evimiz için koltuk arıyorduk, hala müsaitse bugün hemen gelebilirim!",
        noteEn:
          "Looking for an armchair for our student flat, if still available I can come right away today!",
        originalLang: "tr",
        status: "PENDING",
        createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: "ring-4",
        listingId: "lst-espresso",
        requesterId: "user-defne",
        noteTr:
          "Merhaba Alexey! Ofis köşemiz için çok makbule geçer, Moda İskelesi'nde buluşabiliriz.",
        noteEn:
          "Hi Alexey! Would be super helpful for our home office, we can meet at Moda Ferry Pier.",
        originalLang: "tr",
        status: "PENDING",
        createdAt: new Date(now.getTime() - 14 * 60 * 1000).toISOString(),
      },
      {
        id: "ring-5",
        listingId: "lst-baby-stroller",
        requesterId: "user-zeynep",
        noteTr:
          "Kardeşimin bebeği için çok ihtiyacımız vardı, çok teşekkür ederiz!",
        noteEn:
          "We really needed this for my sister's baby, thank you so much!",
        originalLang: "tr",
        status: "SELECTED",
        createdAt: new Date(now.getTime() - 80 * 60 * 1000).toISOString(),
      },
    ],
    boardPosts: [
      {
        id: "post-drill",
        authorId: "user-alexey",
        neighborhoodId: "nb-moda",
        category: "BORROW",
        titleTr: "2 Saatliğine Darbeli Matkap Ödünç Verebilecek Komşu Var mı?",
        titleEn: "Anyone Have a Hammer Drill to Borrow for 2 Hours?",
        contentTr:
          "Merhaba komşular! Kitaplığımı duvara sabitlemem gerekiyor (deprem güvenliği için). 2 saatliğine matkap ödünç verebilecek varsa akşam taze demlenmiş kahve benden!",
        contentEn:
          "Hi neighbors! Need to anchor our bookshelf to the wall for earthquake safety. If anyone can lend a drill for 2 hours, fresh specialty coffee is on me!",
        borrowDurationTr: "⏱️ 2 Saatliğine Ödünç",
        borrowDurationEn: "⏱️ Borrow for 2 Hours",
        distanceMeters: 220,
        subAreaName: "Bademaltı Sokak",
        helpfulCount: 6,
        minutesAgo: 34,
        replies: [
          {
            id: "rep-1",
            authorId: "user-mert",
            textTr:
              "Bende Bosch darbeli matkap ve dübel seti var Alexey! Yoğurtçu Parkı girişinde verebilirim.",
            textEn:
              "I have a Bosch hammer drill and wall plugs set Alexey! Can hand it over at Yogurtcu Park entrance.",
            createdAt: "22 dk önce",
          },
        ],
      },
      {
        id: "post-usta",
        authorId: "user-mert",
        neighborhoodId: "nb-moda",
        category: "USTA_RECOMMEND",
        titleTr: "Güvenilir & Dürüst Kombi / Tesisat Ustası Tavsiyesi (Hasan Usta)",
        titleEn: "Trusted & Honest Plumber / Boiler Technician in Moda (Master Hasan)",
        contentTr:
          "Yıllardır apartmanımızın tesisat işlerine bakan Hasan Usta hem zamanında geliyor hem de fahiş fiyat çekmiyor. İhtiyacı olan komşulara zil sohbetinden numarasını iletebilirim.",
        contentEn:
          "Master Hasan has looked after our building's plumbing for years—always on time and fair local pricing. Happy to share his contact via Zil chat.",
        distanceMeters: 410,
        subAreaName: "Yoğurtçu • Moda",
        helpfulCount: 19,
        minutesAgo: 110,
        replies: [
          {
            id: "rep-2",
            authorId: "user-defne",
            textTr: "Kesinlikle katılıyorum, geçen ay bizim mutfak bataryasını da 15 dakikada çözdü.",
            textEn: "Totally agree, he fixed our kitchen faucet in 15 minutes last month.",
            createdAt: "1 saat önce",
          },
        ],
      },
      {
        id: "post-lost-cat",
        authorId: "user-zeynep",
        neighborhoodId: "nb-moda",
        category: "LOST_FOUND",
        titleTr: "Mavi Tasmalı Tekir Kedi Gören Oldu mu? (Şair Nefi Sokak)",
        titleEn: "Spotted a Tabby Cat with a Blue Collar? (Sair Nefi Street)",
        contentTr:
          "Sabah balkon kapısından bahçeye atlamış, boynunda mavi reflektörlü tasması var. İsmi 'Badem', çok uysaldır. Gören komşular haber verirse çok seviniriz.",
        contentEn:
          "Jumped into the courtyard garden this morning, wearing a blue reflective collar. Named 'Badem', very friendly. Please let us know if spotted!",
        distanceMeters: 640,
        subAreaName: "Şair Nefi Sokak",
        helpfulCount: 14,
        minutesAgo: 185,
        replies: [],
      },
    ],
    chatMessages: [
      {
        id: "msg-1",
        listingId: "lst-ikea-chair",
        senderId: "user-alexey",
        receiverId: "user-defne",
        messageType: "TEXT",
        textTr:
          "Merhaba komşu! Hala müsaitse bugün 17:00 gibi site güvenliğinden gelip alabilirim.",
        textEn:
          "Hi neighbor! If still available, I can pick it up today around 17:00 from the security desk.",
        createdAt: "12 dk önce",
      },
      {
        id: "msg-2",
        listingId: "lst-ikea-chair",
        senderId: "user-defne",
        receiverId: "user-alexey",
        messageType: "TEXT",
        textTr:
          "Merhaba Alexey! Tabii ki, Moda Palas A-Blok güvenliğe bırakabilirim. Sana güvenlik teslim kodu oluşturayım mı?",
        textEn:
          "Hi Alexey! Of course, I can leave it at Moda Palas Block-A security desk. Shall I generate a security pickup code for you?",
        createdAt: "8 dk önce",
      },
      {
        id: "msg-3",
        listingId: "lst-espresso",
        senderId: "user-defne",
        receiverId: "user-alexey",
        messageType: "TEXT",
        textTr:
          "Merhaba Alexey! Kahve makinesi hala müsait mi? Moda İskelesi'nde buluşabiliriz.",
        textEn:
          "Hi Alexey! Is the coffee maker still available? We can meet at Moda Ferry Pier.",
        createdAt: "14 dk önce",
      },
      {
        id: "msg-4",
        listingId: "lst-espresso",
        senderId: "user-alexey",
        receiverId: "user-defne",
        messageType: "SAFE_SPOT_PIN",
        textTr: "📍 Güvenli Buluşma Noktası paylaşıldı: Moda İskelesi Meydanı",
        textEn: "📍 Safe Meetup Spot shared: Moda Ferry Pier Square",
        metadata: {
          safeSpotName: "Moda İskelesi Meydanı",
        },
        createdAt: "10 dk önce",
      },
    ],
    reviews: [],
  };
}

export function readDb(): ZilDatabase {
  try {
    // 1. Check serverless /tmp first if written during current lambda lifecycle
    if (fs.existsSync(TMP_DB_FILE)) {
      const rawTmp = fs.readFileSync(TMP_DB_FILE, "utf-8");
      return JSON.parse(rawTmp) as ZilDatabase;
    }
    // 2. Check local workspace data/zil-db.json
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const raw = fs.readFileSync(LOCAL_DB_FILE, "utf-8");
      return JSON.parse(raw) as ZilDatabase;
    }
    // 3. Initialize seed data
    const seed = getInitialSeedData();
    writeDb(seed);
    return seed;
  } catch {
    return getInitialSeedData();
  }
}

export function writeDb(data: ZilDatabase): ZilDatabase {
  const json = JSON.stringify(data, null, 2);
  try {
    if (!fs.existsSync(LOCAL_DB_DIR)) {
      fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_FILE, json, "utf-8");
  } catch {
    // Serverless read-only root fallback (e.g., Vercel / AWS Lambda)
    try {
      fs.writeFileSync(TMP_DB_FILE, json, "utf-8");
    } catch {
      // Ignore if both fail
    }
  }
  return data;
}
