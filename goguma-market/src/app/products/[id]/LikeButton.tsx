"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LikeButton({
  productId,
  initialCount,
  initialLiked,
  userId,
}: {
  productId: string;
  initialCount: number;
  initialLiked: boolean;
  userId: string | null;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const supabase = createClient();

    if (liked) {
      await supabase.from("likes").delete().eq("product_id", productId).eq("user_id", userId);
      setLiked(false);
      setCount((n) => n - 1);
    } else {
      await supabase.from("likes").insert({ product_id: productId, user_id: userId });
      setLiked(true);
      setCount((n) => n + 1);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border-2 transition-all"
      style={{
        background: liked ? "#fff1f0" : "white",
        borderColor: liked ? "#f97316" : "#ffd4a8",
        color: liked ? "#c2500a" : "#9ca3af",
        boxShadow: liked ? "2px 2px 0 #ffb36b" : "none",
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span className="text-lg">{liked ? "🧡" : "🤍"}</span>
      <span>{count > 0 ? `${count}` : ""} 좋아요</span>
    </button>
  );
}
