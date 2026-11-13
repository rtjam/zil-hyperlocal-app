import { NextRequest, NextResponse } from "next/server";
import { getInitialSeedData, readDb, writeDb } from "@/lib/db";
import { checkProhibitedContent } from "@/lib/temperature";
import { autoTranslateText } from "@/lib/translate";
import {
  AuthProvider,
  BoardCategoryId,
  CategoryId,
  ConditionTag,
  PickupType,
} from "@/lib/types";

export async function GET() {
  const db = readDb();
  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = readDb();

    if (action === "RESET_DEMO") {
      const seed = getInitialSeedData();
      writeDb(seed);
      return NextResponse.json(seed);
    }

    if (action === "SWITCH_USER") {
      const { userId } = body;
      if (db.users.some((u) => u.id === userId)) {
        db.activeUserId = userId;
        writeDb(db);
      }
      return NextResponse.json(db);
    }

    if (action === "COMPLETE_ONBOARDING") {
      const {
        displayName,
        phone,
        email,
        authProvider,
        socialHandle,
        neighborhoodId,
        preferredLang,
      } = body as {
        displayName: string;
        phone: string;
        email?: string;
        authProvider?: AuthProvider;
        socialHandle?: string;
        neighborhoodId: string;
        preferredLang: "tr" | "en";
      };

      const cleanName = displayName?.trim() || "Yeni Komşu";
      const parts = cleanName.split(" ");
      const initials =
        parts.length > 1
          ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
          : cleanName.slice(0, 2).toUpperCase();

      const nb =
        db.neighborhoods.find((n) => n.id === neighborhoodId) ||
        db.neighborhoods[0];

      const provider: AuthProvider = authProvider || "phone";
      const providers: AuthProvider[] =
        provider === "phone" ? ["phone"] : [provider, "phone"];

      const newUserId = `user-${Date.now()}`;
      db.users.unshift({
        id: newUserId,
        displayName: cleanName,
        phoneMasked: phone || "+90 532 ••• •• 84",
        email: email || `${cleanName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
        authProvider: provider,
        socialHandle:
          socialHandle ||
          `@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        connectedProviders: providers,
        roleLabelTr: `Onaylı Komşu • ${nb.nameTr.split("&")[0].trim()}`,
        roleLabelEn: `Verified Neighbor • ${nb.nameEn.split("&")[0].trim()}`,
        avatarColor: "bg-bosporus text-white",
        initials,
        preferredLang: preferredLang || "tr",
        neighborhoodId: nb.id,
        lastGpsVerifiedAt: new Date().toISOString(),
        mannerTemp: 36.5, // Starting body temperature per Section 3.3
        itemsGivenCount: 0,
        itemsReceivedCount: 0,
        weeklyClaimsUsed: 0,
        badges: ["FAST_RESPONDER"],
      });

      db.activeUserId = newUserId;
      writeDb(db);
      return NextResponse.json(db);
    }

    if (action === "TOGGLE_SOCIAL_PROVIDER") {
      const { provider } = body as { provider: AuthProvider };
      const user = db.users.find((u) => u.id === db.activeUserId);
      if (user) {
        const current = user.connectedProviders || ["phone"];
        if (current.includes(provider)) {
          user.connectedProviders = current.filter((p) => p !== provider);
        } else {
          user.connectedProviders = [...current, provider];
        }
        writeDb(db);
      }
      return NextResponse.json(db);
    }

    if (action === "DELETE_ACCOUNT") {
      const deletedId = db.activeUserId;
      if (db.users.length > 1) {
        db.users = db.users.filter((u) => u.id !== deletedId);
        db.listings = db.listings.filter((l) => l.giverId !== deletedId);
        db.bellRings = db.bellRings.filter((r) => r.requesterId !== deletedId);
        db.activeUserId = db.users[0].id;
      } else {
        const seed = getInitialSeedData();
        writeDb(seed);
        return NextResponse.json(seed);
      }
      writeDb(db);
      return NextResponse.json(db);
    }

    if (action === "BLOCK_USER") {
      const { blockedUserId } = body as { blockedUserId: string };
      if (blockedUserId && blockedUserId !== db.activeUserId) {
        db.listings = db.listings.filter((l) => l.giverId !== blockedUserId);
        db.chatMessages = db.chatMessages.filter(
          (m) =>
            m.senderId !== blockedUserId && m.receiverId !== blockedUserId
        );
        writeDb(db);
      }
      return NextResponse.json(db);
    }

    if (action === "REPORT_VIOLATION") {
      const { listingId, reportedUserId, reasonType } = body as {
        listingId?: string;
        reportedUserId: string;
        reasonType: "NO_SHOW" | "ASKED_MONEY_OR_RUDE";
      };

      const targetUser = db.users.find((u) => u.id === reportedUserId);
      if (targetUser) {
        // Blueprint Section 3.3 Penalties:
        // Confirmed no-show at a scheduled meetup: -1.5°C
        // Rudeness or asking to sell/ship a free item: -2.0°C
        const penalty = reasonType === "NO_SHOW" ? 1.5 : 2.0;
        targetUser.mannerTemp = Math.max(
          28.0,
          Number((targetUser.mannerTemp - penalty).toFixed(1))
        );

        if (listingId) {
          db.chatMessages.push({
            id: `msg-${Date.now()}`,
            listingId,
            senderId: db.activeUserId,
            receiverId: reportedUserId,
            messageType: "SYSTEM",
            textTr:
              reasonType === "NO_SHOW"
                ? `⚠️ Buluşmaya gelmeme (No-Show) bildirildi: ${targetUser.displayName} Komşuluk Derecesi -1.5°C düşürüldü (Yeni: ${targetUser.mannerTemp.toFixed(1)}°C).`
                : `⚠️ Ücret talep etme / kural ihlali bildirildi: ${targetUser.displayName} Komşuluk Derecesi -2.0°C düşürüldü (Yeni: ${targetUser.mannerTemp.toFixed(1)}°C).`,
            textEn:
              reasonType === "NO_SHOW"
                ? `⚠️ Confirmed No-Show reported: ${targetUser.displayName} Manner Temp dropped by -1.5°C (Now: ${targetUser.mannerTemp.toFixed(1)}°C).`
                : `⚠️ Asking for money / rule violation reported: ${targetUser.displayName} Manner Temp dropped by -2.0°C (Now: ${targetUser.mannerTemp.toFixed(1)}°C).`,
            createdAt: "Şimdi",
          });
        }

        writeDb(db);
      }
      return NextResponse.json(db);
    }

    if (action === "VERIFY_GPS") {
      const { neighborhoodId } = body;
      const user = db.users.find((u) => u.id === db.activeUserId);
      if (user) {
        user.lastGpsVerifiedAt = new Date().toISOString();
        if (neighborhoodId) {
          user.neighborhoodId = neighborhoodId;
        }
        writeDb(db);
      }
      return NextResponse.json(db);
    }

    if (action === "CREATE_LISTING") {
      const {
        title,
        description,
        photoUrl,
        photoUrls,
        category,
        conditionTag,
        pickupType,
        safeSpotName,
      } = body as {
        title: string;
        description: string;
        photoUrl: string;
        photoUrls?: string[];
        category: Exclude<CategoryId, "ALL">;
        conditionTag: ConditionTag;
        pickupType: PickupType;
        safeSpotName: string;
      };

      const check = checkProhibitedContent(`${title} ${description}`);
      if (check.blocked) {
        return NextResponse.json(
          {
            error: `Prohibited item keyword detected ("${check.keyword}"). Regulated items cannot be shared on ZiL.`,
          },
          { status: 400 }
        );
      }

      const activeUser = db.users.find((u) => u.id === db.activeUserId);
      if (!activeUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isCurbAlert = category === "URGENT" || pickupType === "DOORSTEP";
      const expiresAt = isCurbAlert
        ? new Date(Date.now() + 3 * 3600 * 1000).toISOString()
        : undefined;

      const titleEn = await autoTranslateText(title, "tr", "en");
      const descriptionEn = await autoTranslateText(description, "tr", "en");

      const allPhotos =
        photoUrls && photoUrls.length > 0
          ? photoUrls
          : [
              photoUrl ||
                "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=900&q=80",
            ];

      const newListing = {
        id: `lst-${Date.now()}`,
        giverId: activeUser.id,
        neighborhoodId: activeUser.neighborhoodId,
        titleTr: title,
        titleEn,
        descriptionTr: description,
        descriptionEn,
        photoUrl: allPhotos[0],
        photoUrls: allPhotos,
        category,
        conditionTag,
        pickupType,
        distanceMeters: Math.floor(150 + Math.random() * 320),
        subAreaName: "Caferağa • Moda",
        safeSpotName: safeSpotName || "Moda İskelesi Meydanı",
        fuzzyLatOffset: Math.floor(25 + Math.random() * 50),
        fuzzyLngOffset: Math.floor(25 + Math.random() * 50),
        status: "AVAILABLE" as const,
        expiresAt,
        createdAt: new Date().toISOString(),
        minutesAgo: 1,
      };

      db.listings.unshift(newListing);
      writeDb(db);
      return NextResponse.json(db);
    }

    if (action === "RING_BELL") {
      const { listingId, note } = body as { listingId: string; note: string };
      const activeUser = db.users.find((u) => u.id === db.activeUserId);
      const listing = db.listings.find((l) => l.id === listingId);

      if (!activeUser || !listing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const existing = db.bellRings.find(
        (r) => r.listingId === listingId && r.requesterId === activeUser.id
      );

      if (!existing) {
        const noteEn = await autoTranslateText(note, "tr", "en");

        db.bellRings.push({
          id: `ring-${Date.now()}`,
          listingId,
          requesterId: activeUser.id,
          noteTr: note,
          noteEn,
          originalLang: activeUser.preferredLang === "en" ? "en" : "tr",
          status: "PENDING",
          createdAt: new Date().toISOString(),
        });

        activeUser.weeklyClaimsUsed += 1;

        db.chatMessages.push({
          id: `msg-${Date.now()}`,
          listingId,
          senderId: activeUser.id,
          receiverId: listing.giverId,
          messageType: "TEXT",
          textTr: `🔔 Zile Bastı: "${note}"`,
          textEn: `🔔 Rang the Bell: "${noteEn}"`,
          createdAt: "Şimdi",
        });

        writeDb(db);
      }

      return NextResponse.json(db);
    }

    if (action === "RESERVE_FOR_NEIGHBOR") {
      const { listingId, requesterId, pickupTime } = body as {
        listingId: string;
        requesterId: string;
        pickupTime?: string;
      };

      const listing = db.listings.find((l) => l.id === listingId);
      const requester = db.users.find((u) => u.id === requesterId);

      if (!listing || !requester) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      listing.status = "RESERVED";
      listing.reservedForUserId = requester.id;
      listing.scheduledPickupTime = pickupTime || "Bugün 18:00";

      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `ZİL-${randomDigits}`;
      listing.securityPickupCode = generatedCode;

      db.bellRings.forEach((r) => {
        if (r.listingId === listingId) {
          r.status = r.requesterId === requesterId ? "SELECTED" : "PENDING";
        }
      });

      const isSiteSecurity = listing.pickupType === "SITE_SECURITY";

      db.chatMessages.push({
        id: `msg-${Date.now()}`,
        listingId,
        senderId: listing.giverId,
        receiverId: requester.id,
        messageType: isSiteSecurity ? "SECURITY_CODE" : "SYSTEM",
        textTr: isSiteSecurity
          ? `🤝 Hediye ${requester.displayName} için sözleşildi! Site Güvenliği Teslim Kodu: ${generatedCode} (${listing.safeSpotName})`
          : `🤝 Hediye ${requester.displayName} için sözleşildi! Buluşma noktası: ${listing.safeSpotName}`,
        textEn: isSiteSecurity
          ? `🤝 Reserved for ${requester.displayName}! Site Security Desk Pickup Code: ${generatedCode} (${listing.safeSpotName})`
          : `🤝 Reserved for ${requester.displayName}! Meetup spot: ${listing.safeSpotName}`,
        metadata: {
          securityCode: generatedCode,
          safeSpotName: listing.safeSpotName,
          pickupTime: listing.scheduledPickupTime,
        },
        createdAt: "Şimdi",
      });

      writeDb(db);
      return NextResponse.json(db);
    }

    if (action === "COMPLETE_HANDOFF") {
      const { listingId, onTime, polite, easyPickup } = body as {
        listingId: string;
        onTime: boolean;
        polite: boolean;
        easyPickup: boolean;
      };

      const listing = db.listings.find((l) => l.id === listingId);
      if (!listing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      listing.status = "GIVEN";

      const giver = db.users.find((u) => u.id === listing.giverId);
      const receiverId =
        listing.reservedForUserId ||
        db.bellRings.find((r) => r.listingId === listingId)?.requesterId ||
        "user-alexey";
      const receiver = db.users.find((u) => u.id === receiverId);

      if (giver) {
        giver.itemsGivenCount += 1;
        giver.mannerTemp = Math.min(
          99.0,
          Number((giver.mannerTemp + 0.5).toFixed(1))
        );
        if (
          giver.itemsGivenCount >= 5 &&
          !giver.badges.includes("ZERO_WASTE_HERO")
        ) {
          giver.badges.push("ZERO_WASTE_HERO");
        }
      }

      const tapCount =
        (onTime ? 1 : 0) + (polite ? 1 : 0) + (easyPickup ? 1 : 0);
      const reviewDelta = tapCount === 3 ? 0.4 : tapCount === 2 ? 0.3 : 0.2;

      if (receiver) {
        receiver.itemsReceivedCount += 1;
        receiver.mannerTemp = Math.min(
          99.0,
          Number((receiver.mannerTemp + reviewDelta).toFixed(1))
        );
      }

      db.reviews.push({
        id: `rev-${Date.now()}`,
        listingId,
        reviewerId: db.activeUserId,
        revieweeId: receiverId,
        onTime,
        polite,
        easyPickup,
        tempDelta: reviewDelta,
        createdAt: new Date().toISOString(),
      });

      db.chatMessages.push({
        id: `msg-${Date.now()}`,
        listingId,
        senderId: db.activeUserId,
        receiverId:
          db.activeUserId === listing.giverId ? receiverId : listing.giverId,
        messageType: "SYSTEM",
        textTr: `🎉 Hediye teslim edildi! Komşuluk Derecesi yükseldi (+0.5°C Paylaşım & +${reviewDelta}°C Nezaket Puanı).`,
        textEn: `🎉 Gift handed over! Neighborliness Temperature rose (+0.5°C Sharing & +${reviewDelta}°C Kindness Review).`,
        createdAt: "Şimdi",
      });

      writeDb(db);
      return NextResponse.json(db);
    }

    if (action === "SEND_CHAT_MESSAGE") {
      const {
        listingId,
        receiverId,
        messageType,
        textTr,
        textEn,
        safeSpotName,
        pickupTime,
      } = body;

      const listing = db.listings.find((l) => l.id === listingId);
      if (listing && pickupTime) {
        listing.scheduledPickupTime = pickupTime;
      }
      if (listing && safeSpotName) {
        listing.safeSpotName = safeSpotName;
      }

      const translatedEn =
        textEn && textEn !== textTr
          ? textEn
          : await autoTranslateText(textTr, "tr", "en");

      db.chatMessages.push({
        id: `msg-${Date.now()}`,
        listingId,
        senderId: db.activeUserId,
        receiverId,
        messageType: messageType || "TEXT",
        textTr,
        textEn: translatedEn,
        metadata: {
          safeSpotName,
          pickupTime,
        },
        createdAt: "Şimdi",
      });

      writeDb(db);
      return NextResponse.json(db);
    }

    if (action === "CREATE_BOARD_POST") {
      const { category, title, content, borrowDuration } = body as {
        category: Exclude<BoardCategoryId, "ALL">;
        title: string;
        content: string;
        borrowDuration?: string;
      };
      const activeUser = db.users.find((u) => u.id === db.activeUserId);
      if (!activeUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const titleEn = await autoTranslateText(title, "tr", "en");
      const contentEn = await autoTranslateText(content, "tr", "en");

      db.boardPosts.unshift({
        id: `post-${Date.now()}`,
        authorId: activeUser.id,
        neighborhoodId: activeUser.neighborhoodId,
        category,
        titleTr: title,
        titleEn,
        contentTr: content,
        contentEn,
        borrowDurationTr:
          category === "BORROW"
            ? borrowDuration || "⏱️ 2 Saatliğine Ödünç"
            : undefined,
        borrowDurationEn:
          category === "BORROW" ? "⏱️ Borrow for 2 Hours" : undefined,
        distanceMeters: Math.floor(120 + Math.random() * 280),
        subAreaName: "Moda • Mahalle İçi",
        helpfulCount: 1,
        minutesAgo: 1,
        replies: [],
      });

      writeDb(db);
      return NextResponse.json(db);
    }

    if (action === "REPLY_BOARD_POST") {
      const { postId, text } = body as { postId: string; text: string };
      const post = db.boardPosts.find((p) => p.id === postId);
      if (post) {
        const textEn = await autoTranslateText(text, "tr", "en");
        post.replies.push({
          id: `rep-${Date.now()}`,
          authorId: db.activeUserId,
          textTr: text,
          textEn,
          createdAt: "Şimdi",
        });
        post.helpfulCount += 1;
        writeDb(db);
      }
      return NextResponse.json(db);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
