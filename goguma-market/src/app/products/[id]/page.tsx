import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "./DeleteButton";
import ImageGallery from "./ImageGallery";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === product.user_id;
  const timeAgo = getTimeAgo(product.created_at);
  const images: string[] = product.images ?? [];

  // 좋아요 수 + 내가 눌렀는지
  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  let userLiked = false;
  if (user) {
    const { data: myLike } = await supabase
      .from("likes")
      .select("id")
      .eq("product_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    userLiked = !!myLike;
  }

  // 댓글 목록 (이메일 포함)
  const { data: comments } = await supabase
    .from("comments_with_email")
    .select("*")
    .eq("product_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium mb-6"
        style={{ color: "#ea6a0a" }}
      >
        ← 목록으로
      </Link>

      <div className="goguma-card overflow-hidden">

        {/* 이미지 영역 */}
        {images.length > 0 ? (
          <ImageGallery images={images} title={product.title} />
        ) : (
          <div
            className="w-full flex items-center justify-center text-7xl"
            style={{ background: "#fff8f0", height: "260px" }}
          >
            {getCategoryEmoji(product.category)}
          </div>
        )}

        <div className="p-6">

          {/* 상태 배지 */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs px-3 py-1 rounded-full font-bold"
              style={{
                background: product.status === "available" ? "#fff8f0" : "#f3f4f6",
                color: product.status === "available" ? "#ea6a0a" : "#6b7280",
                border: `1px solid ${product.status === "available" ? "#ffd4a8" : "#e5e7eb"}`,
              }}
            >
              {product.status === "available" ? "🟠 판매중" : "✅ 판매완료"}
            </span>
            <span className="text-xs text-gray-400">{product.category}</span>
            <span className="text-xs text-gray-400 ml-auto">{timeAgo}</span>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">{product.title}</h1>

          <p className="text-3xl font-black mb-4" style={{ color: "#c2500a" }}>
            {product.price.toLocaleString()}원
          </p>

          <div
            className="flex items-center gap-2 text-sm font-medium mb-5 px-3 py-2 rounded-xl"
            style={{ background: "#fff8f0", color: "#ea6a0a" }}
          >
            📍 {product.location}
          </div>

          <hr style={{ borderColor: "#ffd4a8", marginBottom: "1.25rem" }} />

          {/* 설명 */}
          <div className="mb-6">
            <p className="text-sm font-bold mb-2" style={{ color: "#c2500a" }}>상품 설명</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* 좋아요 버튼 */}
          <div className="mb-5">
            <LikeButton
              productId={product.id}
              initialCount={likeCount ?? 0}
              initialLiked={userLiked}
              userId={user?.id ?? null}
            />
          </div>

          {/* 내 글일 때 수정/삭제 */}
          {isOwner && (
            <div className="flex gap-3 pt-2 mb-2">
              <Link
                href={`/products/${product.id}/edit`}
                className="goguma-btn-outline flex-1 py-3 text-center"
              >
                ✏️ 수정하기
              </Link>
              <DeleteButton productId={product.id} images={images} />
            </div>
          )}

        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="goguma-card p-6 mt-4">
        <CommentSection
          productId={product.id}
          initialComments={comments ?? []}
          userId={user?.id ?? null}
        />
      </div>

    </div>
  );
}

function getCategoryEmoji(category: string) {
  const map: Record<string, string> = {
    "디지털/가전": "💻",
    "의류/잡화": "👕",
    "가구/인테리어": "🛋️",
    "도서/음반": "📚",
    "스포츠/레저": "⚽",
    "유아동": "🧸",
    "식물": "🪴",
    "기타": "📦",
  };
  return map[category] ?? "📦";
}

function getTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}
