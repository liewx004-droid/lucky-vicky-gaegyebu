"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({
  productId,
  images,
}: {
  productId: string;
  images: string[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("정말 삭제할까요? 😢")) return;

    setLoading(true);
    const supabase = createClient();

    // Storage에서 이미지 파일 삭제
    if (images.length > 0) {
      const paths = images.map((url) => {
        // URL에서 Storage 경로 추출: /storage/v1/object/public/product-images/{path}
        const marker = "/product-images/";
        const idx = url.indexOf(marker);
        return idx !== -1 ? url.slice(idx + marker.length) : null;
      }).filter(Boolean) as string[];

      if (paths.length > 0) {
        await supabase.storage.from("product-images").remove(paths);
      }
    }

    await supabase.from("products").delete().eq("id", productId);
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex-1 py-3 rounded-full font-bold text-sm border-2 transition-all"
      style={{
        background: "white",
        color: "#be123c",
        borderColor: "#fecdd3",
        boxShadow: "3px 3px 0 #fecdd3",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "삭제 중..." : "🗑️ 삭제하기"}
    </button>
  );
}
