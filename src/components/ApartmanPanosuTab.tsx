"use client";

import React, { useState } from "react";
import {
  BoardCategoryId,
  BoardPost,
  Language,
  NeighborUser,
} from "@/lib/types";
import {
  Globe,
  MessageCircle,
  ThumbsUp,
  Plus,
  Send,
  X,
} from "lucide-react";

interface ApartmanPanosuTabProps {
  posts: BoardPost[];
  users: NeighborUser[];
  activeUser: NeighborUser;
  radiusKm: 0.5 | 1.5 | 3.0;
  lang: Language;
  onCreatePost: (payload: {
    category: Exclude<BoardCategoryId, "ALL">;
    title: string;
    content: string;
    borrowDuration?: string;
  }) => Promise<void>;
  onReplyPost: (postId: string, text: string) => Promise<void>;
}

export function ApartmanPanosuTab({
  posts,
  users,
  activeUser,
  radiusKm,
  lang,
  onCreatePost,
  onReplyPost,
}: ApartmanPanosuTabProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<BoardCategoryId>("ALL");
  const [translatedIds, setTranslatedIds] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedPostId, setExpandedPostId] = useState<string | null>(
    "post-drill"
  );
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCategory, setNewCategory] =
    useState<Exclude<BoardCategoryId, "ALL">>("BORROW");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [replyTextByPost, setReplyTextByPost] = useState<
    Record<string, string>
  >({});

  const filteredPosts = posts.filter((p) => {
    const withinRadius = p.distanceMeters <= radiusKm * 1000;
    const matchesCat =
      selectedCategory === "ALL" || p.category === selectedCategory;
    return withinRadius && matchesCat;
  });

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    await onCreatePost({
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      borrowDuration:
        newCategory === "BORROW" ? "⏱️ 2 Saatliğine" : undefined,
    });
    setNewTitle("");
    setNewContent("");
    setShowNewModal(false);
  };

  return (
    <div className="relative">
      {/* Karrot '동네생활' Minimalist Topic Chips */}
      <div className="flex items-center justify-between border-b border-[#F1EFEA] px-4 py-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { id: "ALL", tr: "Tümü", en: "All" },
              { id: "BORROW", tr: "Ödünç İste", en: "Borrow" },
              { id: "USTA_RECOMMEND", tr: "Usta Tavsiye", en: "Local Pros" },
              { id: "LOST_FOUND", tr: "Kayıp", en: "Lost & Found" },
              { id: "NEIGHBOR_CHAT", tr: "Sohbet", en: "Chat" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                selectedCategory === cat.id
                  ? "bg-charcoal text-white"
                  : "bg-[#FAF8F5] text-stone border border-[#E5E7EB]"
              }`}
            >
              {lang === "tr" ? cat.tr : cat.en}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(!showNewModal)}
          className="ml-2 shrink-0 inline-flex items-center gap-1 rounded-full bg-bosporus px-3 py-1 text-xs font-bold text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          {lang === "tr" ? "Yaz" : "Post"}
        </button>
      </div>

      {/* Inline Sheet for New Board Post */}
      {showNewModal && (
        <form
          onSubmit={handleSubmitNew}
          className="border-b border-[#F1EFEA] bg-[#FAF8F5] p-4 space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(
                [
                  { id: "BORROW", tr: "Ödünç", en: "Borrow" },
                  { id: "USTA_RECOMMEND", tr: "Usta", en: "Pro" },
                  { id: "LOST_FOUND", tr: "Kayıp", en: "Lost" },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setNewCategory(c.id)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    newCategory === c.id
                      ? "bg-bosporus text-white"
                      : "bg-white text-stone border border-gray-200"
                  }`}
                >
                  {lang === "tr" ? c.tr : c.en}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowNewModal(false)}
              className="text-stone"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={
              lang === "tr"
                ? "Komşularına ne sormak istersin?"
                : "What would you like to ask neighbors?"
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none"
          />

          <textarea
            rows={2}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={lang === "tr" ? "Detaylar..." : "Details..."}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-charcoal focus:outline-none"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-amberbell py-2 text-xs font-extrabold text-charcoal"
          >
            {lang === "tr" ? "Panoda Paylaş" : "Publish"}
          </button>
        </form>
      )}

      {/* Karrot Divider-Separated Minimalist Feed */}
      <div className="divide-y divide-[#F1EFEA]">
        {filteredPosts.map((post) => {
          const author =
            users.find((u) => u.id === post.authorId) || activeUser;
          const isTranslated = !!translatedIds[post.id];
          const showEnglish =
            (lang === "en" && !isTranslated) ||
            (lang === "tr" && isTranslated);
          const isExpanded = expandedPostId === post.id;

          return (
            <div key={post.id} className="px-4 py-4 space-y-2">
              {/* Subtle Topic Tag */}
              <div className="flex items-center justify-between">
                <span className="inline-block rounded bg-[#FAF8F5] px-2 py-0.5 text-[11px] font-semibold text-stone border border-[#E5E7EB]">
                  {post.category === "BORROW"
                    ? lang === "tr"
                      ? "Ödünç İste • 2 Saat"
                      : "Borrow • 2 Hrs"
                    : post.category === "USTA_RECOMMEND"
                    ? lang === "tr"
                      ? "Usta & Tavsiye"
                      : "Local Pro"
                    : post.category === "LOST_FOUND"
                    ? lang === "tr"
                      ? "Kayıp & Buluntu"
                      : "Lost & Found"
                    : lang === "tr"
                    ? "Mahalle Sohbeti"
                    : "Street Chat"}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setTranslatedIds((prev) => ({
                      ...prev,
                      [post.id]: !prev[post.id],
                    }))
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-stone hover:text-bosporus"
                >
                  <Globe className="h-3 w-3" />
                  {isTranslated
                    ? lang === "tr"
                      ? "TR"
                      : "EN"
                    : lang === "tr"
                    ? "Çevir"
                    : "Translate"}
                </button>
              </div>

              {/* Title & Body */}
              <div
                onClick={() =>
                  setExpandedPostId(isExpanded ? null : post.id)
                }
                className="cursor-pointer space-y-1"
              >
                <h3 className="text-[15px] font-bold text-charcoal leading-snug">
                  {showEnglish ? post.titleEn : post.titleTr}
                </h3>
                <p className="text-[13px] leading-relaxed text-charcoal/80">
                  {showEnglish ? post.contentEn : post.contentTr}
                </p>
              </div>

              {/* Karrot Bottom Metadata Row */}
              <div className="flex items-center justify-between pt-1 text-xs text-stone">
                <span>
                  {author.displayName} ({author.mannerTemp.toFixed(1)}°) •{" "}
                  {post.subAreaName} • {post.minutesAgo}dk
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setExpandedPostId(isExpanded ? null : post.id)
                  }
                  className="flex items-center gap-3 text-xs font-medium text-stone"
                >
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {post.helpfulCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {post.replies.length}
                  </span>
                </button>
              </div>

              {/* Collapsible Replies Section */}
              {isExpanded && (
                <div className="mt-2 space-y-2 rounded-xl bg-[#FAF8F5] p-3">
                  {post.replies.map((rep) => {
                    const repUser =
                      users.find((u) => u.id === rep.authorId) || activeUser;
                    return (
                      <div key={rep.id} className="text-xs leading-relaxed">
                        <span className="font-bold text-charcoal">
                          {repUser.displayName}:{" "}
                        </span>
                        <span className="text-charcoal/85">
                          {showEnglish ? rep.textEn : rep.textTr}
                        </span>
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={replyTextByPost[post.id] || ""}
                      onChange={(e) =>
                        setReplyTextByPost((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      placeholder={
                        lang === "tr" ? "Yanıt yaz..." : "Write a reply..."
                      }
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-charcoal focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const val = replyTextByPost[post.id]?.trim();
                        if (!val) return;
                        await onReplyPost(post.id, val);
                        setReplyTextByPost((prev) => ({
                          ...prev,
                          [post.id]: "",
                        }));
                      }}
                      className="rounded-lg bg-bosporus p-1.5 text-white"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
