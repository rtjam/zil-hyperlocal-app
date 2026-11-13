export type Language = "tr" | "en";

export type AuthProvider =
  | "google"
  | "apple"
  | "instagram"
  | "facebook"
  | "phone";

export type CategoryId =
  | "ALL"
  | "URGENT"
  | "BABY_KIDS"
  | "HOME"
  | "BOOKS_HOBBY"
  | "PETS"
  | "PLANTS";

export type PickupType = "SITE_SECURITY" | "SAFE_SPOT" | "DOORSTEP";

export type ConditionTag = "LIKE_NEW" | "GOOD" | "FUNCTIONAL";

export type ListingStatus = "AVAILABLE" | "RESERVED" | "GIVEN";

export type BoardCategoryId =
  | "ALL"
  | "LOST_FOUND"
  | "USTA_RECOMMEND"
  | "BORROW"
  | "NEIGHBOR_CHAT";

export interface Neighborhood {
  id: string;
  nameTr: string;
  nameEn: string;
  district: string;
  city: string;
  centerLat: number;
  centerLng: number;
  safeSpots: string[];
}

export interface NeighborUser {
  id: string;
  displayName: string;
  phoneMasked?: string;
  email?: string;
  authProvider?: AuthProvider;
  socialHandle?: string;
  connectedProviders?: AuthProvider[];
  roleLabelTr: string;
  roleLabelEn: string;
  avatarColor: string;
  initials: string;
  preferredLang: "tr" | "en" | "ru";
  neighborhoodId: string;
  lastGpsVerifiedAt: string;
  mannerTemp: number; // e.g., 36.5 to 99.0
  itemsGivenCount: number;
  itemsReceivedCount: number;
  weeklyClaimsUsed: number;
  badges: ("ZERO_WASTE_HERO" | "EXPAT_FRIENDLY" | "FAST_RESPONDER")[];
}

export interface BellRingRequest {
  id: string;
  listingId: string;
  requesterId: string;
  noteTr: string;
  noteEn: string;
  originalLang: "tr" | "en";
  status: "PENDING" | "SELECTED" | "COMPLETED";
  createdAt: string;
}

export interface Listing {
  id: string;
  giverId: string;
  neighborhoodId: string;
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  photoUrl: string;
  photoUrls?: string[]; // 1-5 photos (WebP compressed)
  category: Exclude<CategoryId, "ALL">;
  conditionTag: ConditionTag;
  pickupType: PickupType;
  distanceMeters: number;
  subAreaName: string;
  safeSpotName: string;
  fuzzyLatOffset: number; // Percentage on neighborhood map (15..85)
  fuzzyLngOffset: number; // Percentage on neighborhood map (15..85)
  status: ListingStatus;
  reservedForUserId?: string;
  securityPickupCode?: string; // e.g. 'ZİL-4821' for Site Güvenliğinden Teslim
  scheduledPickupTime?: string;
  expiresAt?: string; // ISO string for 3-hour Curb Alert ('URGENT')
  createdAt: string;
  minutesAgo: number;
}

export interface BoardReply {
  id: string;
  authorId: string;
  textTr: string;
  textEn: string;
  createdAt: string;
}

export interface BoardPost {
  id: string;
  authorId: string;
  neighborhoodId: string;
  category: Exclude<BoardCategoryId, "ALL">;
  titleTr: string;
  titleEn: string;
  contentTr: string;
  contentEn: string;
  borrowDurationTr?: string;
  borrowDurationEn?: string;
  distanceMeters: number;
  subAreaName: string;
  helpfulCount: number;
  minutesAgo: number;
  replies: BoardReply[];
}

export interface ChatMessage {
  id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  messageType:
    | "TEXT"
    | "SAFE_SPOT_PIN"
    | "PICKUP_TIME"
    | "SECURITY_CODE"
    | "SYSTEM";
  textTr: string;
  textEn: string;
  metadata?: {
    safeSpotName?: string;
    pickupTime?: string;
    securityCode?: string;
  };
  createdAt: string;
}

export interface TemperatureReview {
  id: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  onTime: boolean;
  polite: boolean;
  easyPickup: boolean;
  tempDelta: number;
  createdAt: string;
}

export interface ZilDatabase {
  activeUserId: string;
  neighborhoods: Neighborhood[];
  users: NeighborUser[];
  listings: Listing[];
  bellRings: BellRingRequest[];
  boardPosts: BoardPost[];
  chatMessages: ChatMessage[];
  reviews: TemperatureReview[];
}
