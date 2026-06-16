"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  email: string;
};

export default function CommentSection({
  productId,
  initialComments,
  userId,
}: {
  productId: string;
  initialComments: Comment[];
  userId: string | null;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) { router.push("/login"); return; }
    if (!text.trim()) return;

    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    const { data, error: insertError } = await supabase
      .from("comments")
      .insert({ product_id: productId, user_id: userId, content: text.trim() })
      .select()
      .single();

    if (insertError || !data) {
      setError("댓글 등록에 실패했어요.");
    } else {
      // 뷰에서 이메일 가져오기
      const { data: full } = await supabase
        .from("comments_with_email")
        .select("*")
        .eq("id", data.id)
        .single();

      setComments((prev) => [
        ...(full ? [full as Comment] : [{ ...data, email: "" }]),
        ...prev,
      ]);
      setText("");
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제할까요?")) return;
    setDeletingId(commentId);
    const supabase = createClient();
    await supabase.from("comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setDeletingId(null);
  };

  return (
    <div className="mt-8">
      <h2 className="text-base font-black mb-4" style={{ color: "#c2500a" }}>
        💬 댓글 {comments.length > 0 ? `(${comments.length})` : ""}
      </h2>

      {/* 댓글 입력 */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
        <input
          className="goguma-input flex-1 py-2.5 text-sm"
          placeholder={userId ? "댓글을 입력하세요..." : "로그인 후 댓글을 남길 수 있어요"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          disabled={!userId || submitting}
        />
        <button
          type="submit"
          disabled={!userId || submitting || !text.trim()}
          className="goguma-btn px-4 py-2.5 text-sm whitespace-nowrap"
          style={{ opacity: (!userId || submitting || !text.trim()) ? 0.5 : 1 }}
        >
          {submitting ? "..." : "등록"}
        </button>
      </form>

      {error && (
        <p className="text-sm mb-3" style={{ color: "#be123c" }}>{error}</p>
      )}

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <div
          className="text-center py-8 rounded-xl text-sm"
          style={{ background: "#fff8f0", color: "#ffb36b" }}
        >
          아직 댓글이 없어요. 첫 댓글을 남겨보세요! 🍠
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{ background: "#fff8f0", border: "1px solid #ffd4a8" }}
            >
              {/* 아바타 */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                style={{ background: "#ffb36b", color: "white" }}
              >
                {c.email?.[0]?.toUpperCase() ?? "?"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: "#c2500a" }}>
                    {c.email?.split("@")[0] ?? "익명"}
                  </span>
                  <span className="text-xs" style={{ color: "#ffb36b" }}>
                    {getTimeAgo(c.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 break-words leading-relaxed">{c.content}</p>
              </div>

              {/* 내 댓글만 삭제 버튼 */}
              {userId === c.user_id && (
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="text-xs flex-shrink-0 mt-0.5"
                  style={{ color: "#fca5a5" }}
                >
                  {deletingId === c.id ? "..." : "삭제"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getTimeAgo(dateString: string) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}
