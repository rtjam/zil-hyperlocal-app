"use client";

import React from "react";
import { Language, Listing, Neighborhood } from "@/lib/types";
import { ShieldCheck, MapPin, Navigation } from "lucide-react";

interface NeighborhoodMapProps {
  neighborhood: Neighborhood;
  listings: Listing[];
  radiusKm: 0.5 | 1.5 | 3.0;
  selectedListing?: Listing | null;
  onSelectListing?: (listing: Listing) => void;
  lang: Language;
  compact?: boolean;
}

export function NeighborhoodMap({
  neighborhood,
  listings,
  radiusKm,
  selectedListing,
  onSelectListing,
  lang,
  compact = false,
}: NeighborhoodMapProps) {
  const radiusPercent =
    radiusKm === 0.5 ? 36 : radiusKm === 1.5 ? 68 : 94;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-[#E6F1EC] ${
        compact ? "h-48" : "h-72 sm:h-80"
      }`}
    >
      {/* Stylized Bosporus Sea & Kadıköy/Moda Street Grid SVG */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 260"
        preserveAspectRatio="none"
      >
        {/* Marmara / Bosporus water corner */}
        <path
          d="M 0,190 Q 110,175 185,220 T 400,205 L 400,260 L 0,260 Z"
          fill="#BDE0EA"
          opacity="0.85"
        />
        <path
          d="M 0,205 Q 120,192 200,230 T 400,220 L 400,260 L 0,260 Z"
          fill="#9CCDE0"
          opacity="0.7"
        />

        {/* Green parks (Yoğurtçu Parkı & Moda Sahil Parkı) */}
        <ellipse cx="290" cy="115" rx="45" ry="26" fill="#C7E8CA" />
        <ellipse cx="95" cy="155" rx="38" ry="20" fill="#C7E8CA" />

        {/* Neighborhood street grid lines */}
        <g stroke="#FAF8F5" strokeWidth="3.5" opacity="0.85">
          <line x1="40" y1="0" x2="120" y2="210" />
          <line x1="160" y1="0" x2="210" y2="220" />
          <line x1="280" y1="0" x2="250" y2="225" />
          <line x1="0" y1="55" x2="400" y2="85" />
          <line x1="0" y1="125" x2="400" y2="140" />
          <line x1="20" y1="175" x2="360" y2="170" />
        </g>

        {/* Official Mahalle Polygon Boundary (PostGIS Polygon representation) */}
        <polygon
          points="35,28 345,22 372,165 235,205 68,185"
          fill="rgba(15, 76, 92, 0.08)"
          stroke="#0F4C5C"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      </svg>

      {/* Active GPS Radius Circle */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sage/60 bg-sage/10 transition-all duration-500"
        style={{
          width: `${radiusPercent}%`,
          height: `${radiusPercent}%`,
        }}
      />

      {/* User's Current Verified GPS Anchor in Center */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <span className="h-3.5 w-3.5 rounded-full bg-bosporus ring-4 ring-white shadow" />
      </div>

      {/* Listing Fuzzy Privacy Circles & Safe Spot Pins */}
      {listings.map((item) => {
        const isSelected = selectedListing?.id === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectListing?.(item)}
            style={{
              top: `${item.fuzzyLatOffset}%`,
              left: `${item.fuzzyLngOffset}%`,
            }}
            className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
          >
            {/* 250m–300m KVKK Fuzzy Privacy Circle */}
            <span
              className={`block rounded-full transition-all ${
                isSelected
                  ? "h-16 w-16 bg-amberbell/30 border-2 border-amberbell animate-pulse"
                  : "h-11 w-11 bg-bosporus/15 border border-bosporus/40 group-hover:scale-110"
              }`}
            />
            {/* Center Safe Pin */}
            <span
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold shadow-md transition-transform ${
                isSelected
                  ? "bg-amberbell text-charcoal scale-110 ring-2 ring-white"
                  : item.status === "RESERVED"
                  ? "bg-amber-100 text-amber-900 border border-amber-400"
                  : "bg-bosporus text-white"
              }`}
            >
              {item.pickupType === "SITE_SECURITY"
                ? "🏢"
                : item.pickupType === "SAFE_SPOT"
                ? "☕"
                : "🚪"}
              <span className="max-w-[90px] truncate">
                {item.distanceMeters}m
              </span>
            </span>
          </button>
        );
      })}

      {/* Top-Left PostGIS Polygon Badge */}
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-bosporus shadow-sm backdrop-blur">
        <ShieldCheck className="h-3.5 w-3.5 text-sage" />
        <span>
          {lang === "tr" ? neighborhood.nameTr : neighborhood.nameEn} •{" "}
          {radiusKm} km
        </span>
      </div>

      {/* Bottom KVKK Privacy Note */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between rounded-xl bg-white/95 px-3 py-1.5 text-[11px] text-stone shadow-sm backdrop-blur">
        <span className="flex items-center gap-1.5 font-medium text-charcoal">
          <MapPin className="h-3.5 w-3.5 text-amberbell shrink-0" />
          {selectedListing
            ? `${selectedListing.safeSpotName} (${selectedListing.distanceMeters}m)`
            : lang === "tr"
            ? "KVKK Güvencesi: Tam daire konumu gizlenir (250m bulanık çember)"
            : "KVKK Privacy: Exact apartment pin hidden (250m fuzzy circle)"}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 text-sage font-semibold">
          <Navigation className="h-3 w-3" />
          PostGIS
        </span>
      </div>
    </div>
  );
}
