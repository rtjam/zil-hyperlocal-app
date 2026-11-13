-- =============================================================================
-- ZiL — Hyperlocal Neighborhood Giveaway & Community App
-- Complete Phase 1 PostgreSQL + PostGIS Database Schema (Supabase Ready)
-- =============================================================================

-- Enable PostGIS for hyperlocal neighborhood boundary & radius queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Neighborhoods (Mahalle & Major Siteler Polygons)
CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_tr VARCHAR(120) NOT NULL,          -- e.g., 'Caferağa Mahallesi'
    name_en VARCHAR(120) NOT NULL,          -- e.g., 'Caferaga Neighborhood'
    district VARCHAR(120) NOT NULL,         -- e.g., 'Kadıköy'
    city VARCHAR(80) NOT NULL,              -- e.g., 'İstanbul'
    boundary GEOMETRY(Polygon, 4326),       -- Official Mahalle polygon
    center_point GEOMETRY(Point, 4326),
    safe_spots JSONB DEFAULT '[]'::jsonb,   -- Pre-verified public meetup spots
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users (Komşular)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_hash VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(30) DEFAULT 'google', -- 'google', 'apple', 'instagram', 'facebook', 'phone'
    social_handle VARCHAR(120),                 -- e.g., '@defne.moda'
    connected_providers JSONB DEFAULT '["google", "phone"]'::jsonb,
    display_name VARCHAR(80) NOT NULL,
    avatar_url TEXT,
    preferred_lang VARCHAR(5) DEFAULT 'tr', -- 'tr', 'en', 'ru', 'de', 'ar'
    primary_neighborhood_id UUID REFERENCES neighborhoods(id),
    last_gps_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    manner_temp NUMERIC(4,1) DEFAULT 36.5 CHECK (manner_temp BETWEEN 0.0 AND 99.9),
    items_given_count INT DEFAULT 0,
    items_received_count INT DEFAULT 0,
    weekly_claims_used INT DEFAULT 0,
    kvkk_consent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    badges JSONB DEFAULT '[]'::jsonb,       -- ['ZERO_WASTE_HERO', 'EXPAT_FRIENDLY', 'FAST_RESPONDER']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Free Giveaway Listings (Hediyeler)
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    neighborhood_id UUID REFERENCES neighborhoods(id),
    title VARCHAR(140) NOT NULL,
    title_en VARCHAR(140),
    description TEXT,
    description_en TEXT,
    photo_url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,          -- 'URGENT', 'BABY_KIDS', 'HOME', 'BOOKS_HOBBY', 'PETS', 'PLANTS'
    condition_tag VARCHAR(40) NOT NULL,     -- 'LIKE_NEW', 'GOOD', 'FUNCTIONAL'
    pickup_type VARCHAR(40) NOT NULL,       -- 'SITE_SECURITY', 'SAFE_SPOT', 'DOORSTEP'
    fuzzy_location GEOMETRY(Point, 4326) NOT NULL, -- Randomized within 150-300m for KVKK privacy
    distance_meters INT DEFAULT 350,
    safe_spot_name VARCHAR(140),
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RESERVED', 'GIVEN', 'EXPIRED'
    reserved_for_user_id UUID REFERENCES users(id),
    security_pickup_code VARCHAR(16),       -- Enhancement: 'ZİL-XXXX' for Site Güvenliğinden Teslim
    scheduled_pickup_time VARCHAR(80),
    expires_at TIMESTAMP WITH TIME ZONE,    -- Enhancement: 3-hour auto-expiry for 'Hemen Al-Götür' Curb Alerts
    ring_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial Index for instant <50ms hyperlocal feed queries
CREATE INDEX idx_listings_location ON listings USING GIST (fuzzy_location);
CREATE INDEX idx_listings_neighborhood_status ON listings(neighborhood_id, status);

-- 4. Bell Rings / Requests ("Zile Bas" & Anti-Hoarder Fair Share Engine)
CREATE TABLE bell_rings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,                     -- 1-sentence polite note or icebreaker
    note_en TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',   -- 'PENDING', 'SELECTED', 'COMPLETED', 'DECLINED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(listing_id, requester_id)
);

-- 5. Apartman Panosu (Hyperlocal Community Feed)
CREATE TABLE board_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    neighborhood_id UUID REFERENCES neighborhoods(id),
    category VARCHAR(40) NOT NULL,          -- 'LOST_FOUND', 'USTA_RECOMMEND', 'BORROW', 'NEIGHBOR_CHAT'
    title VARCHAR(140) NOT NULL,
    title_en VARCHAR(140),
    content TEXT NOT NULL,
    content_en TEXT,
    borrow_duration VARCHAR(60),            -- e.g., '2 Saatliğine / For 2 hours'
    distance_meters INT DEFAULT 200,
    helpful_count INT DEFAULT 0,
    replies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Zil Sesi (In-App Chat & Meetup Coordinator)
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(30) DEFAULT 'TEXT', -- 'TEXT', 'SAFE_SPOT_PIN', 'PICKUP_TIME', 'SECURITY_CODE', 'SYSTEM'
    text_tr TEXT NOT NULL,
    text_en TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Temperature Reviews ("Komşuluk Derecesi" 3-Tap Post-Handoff Feedback)
CREATE TABLE temperature_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    on_time BOOLEAN DEFAULT TRUE,
    polite BOOLEAN DEFAULT TRUE,
    easy_pickup BOOLEAN DEFAULT TRUE,
    temp_delta NUMERIC(3,1) NOT NULL,       -- +0.2 to +0.5 or -1.5 for no-show
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(listing_id, reviewer_id)
);

-- =============================================================================
-- Hyperlocal Radius Query Function (PostGIS)
-- =============================================================================
CREATE OR REPLACE FUNCTION get_hyperlocal_listings(
    user_lng DOUBLE PRECISION,
    user_lat DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 1500
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    category VARCHAR,
    pickup_type VARCHAR,
    status VARCHAR,
    ring_count INT,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.title, l.category, l.pickup_type, l.status, l.ring_count,
           ST_Distance(
               l.fuzzy_location::geography,
               ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
           ) AS distance_meters
    FROM listings l
    WHERE l.status != 'GIVEN'
      AND (l.expires_at IS NULL OR l.expires_at > NOW())
      AND ST_DWithin(
            l.fuzzy_location::geography,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            radius_meters
          )
    ORDER BY l.created_at DESC
    LIMIT 40;
END;
$$ LANGUAGE plpgsql;
