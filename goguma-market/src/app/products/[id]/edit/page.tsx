"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

const CATEGORIES = [
  { value: "디지털/가전", emoji: "💻" },
  { value: "의류/잡화", emoji: "👕" },
  { value: "가구/인테리어", emoji: "🛋️" },
  { value: "도서/음반", emoji: "📚" },
  { value: "스포츠/레저", emoji: "⚽" },
  { value: "유아동", emoji: "🧸" },
  { value: "식물", emoji: "🪴" },
  { value: "기타", emoji: "📦" },
];

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    price: "",
    location: "",
    description: "",
    status: "available",
  });

  // 기존 이미지 URL (이미 저장된 것)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // 삭제 예정인 기존 이미지 URL
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  // 새로 추가할 이미지 파일
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!product || product.user_id !== user.id) {
        router.push("/");
        return;
      }

      setForm({
        title: product.title,
        category: product.category,
        price: String(product.price),
        location: product.location,
        description: product.description,
        status: product.status,
      });
      setExistingImages(product.images ?? []);
      setFetching(false);
    };
    load();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
    setForm((prev) => ({ ...prev, price: onlyNumbers }));
  };

  const totalImageCount = existingImages.filter(u => !removedImages.includes(u)).length + newImageFiles.length;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (totalImageCount + files.length > 5) {
      setError("사진은 최대 5장까지 올릴 수 있어요!");
      return;
    }
    setError(null);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExisting = (url: string) => {
    setRemovedImages((prev) => [...prev, url]);
  };

  const removeNew = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.category) {
      setError("카테고리를 선택해주세요!");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // 삭제 예정 이미지를 Storage에서 제거
    if (removedImages.length > 0) {
      const paths = removedImages.map((url) => {
        const marker = "/product-images/";
        const idx = url.indexOf(marker);
        return idx !== -1 ? url.slice(idx + marker.length) : null;
      }).filter(Boolean) as string[];
      if (paths.length > 0) {
        await supabase.storage.from("product-images").remove(paths);
      }
    }

    // 새 이미지 업로드
    const newUrls: string[] = [];
    for (const file of newImageFiles) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file);
      if (uploadError) {
        setError("이미지 업로드 중 오류가 생겼어요.");
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }

    const finalImages = [
      ...existingImages.filter((u) => !removedImages.includes(u)),
      ...newUrls,
    ];

    const { error: updateError } = await supabase
      .from("products")
      .update({
        title: form.title,
        category: form.category,
        price: parseInt(form.price),
        location: form.location,
        description: form.description,
        status: form.status,
        images: finalImages,
      })
      .eq("id", id);

    setLoading(false);

    if (updateError) {
      setError("저장 중 오류가 생겼어요. 다시 시도해주세요.");
    } else {
      router.push(`/products/${id}`);
      router.refresh();
    }
  };

  if (fetching) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center" style={{ color: "#ffb36b" }}>
        불러오는 중...
      </div>
    );
  }

  const keptImages = existingImages.filter((u) => !removedImages.includes(u));

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#c2500a" }}>
          ✏️ 판매글 수정
        </h1>
        <p className="text-sm mt-1" style={{ color: "#ffb36b" }}>
          내용을 수정하고 저장해봐요!
        </p>
      </div>

      <div className="goguma-card p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* 사진 관리 */}
          <div>
            <label className="goguma-label">사진 (최대 5장)</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {/* 기존 이미지 */}
              {keptImages.map((url, i) => (
                <div key={`existing-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2" style={{ borderColor: "#ffd4a8" }}>
                  <Image src={url} alt={`기존 사진 ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(url)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* 새 이미지 미리보기 */}
              {newImagePreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2" style={{ borderColor: "#ffd4a8" }}>
                  <Image src={src} alt={`새 사진 ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* 추가 버튼 */}
              {totalImageCount < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-xs font-medium gap-1 transition-colors"
                  style={{ borderColor: "#ffd4a8", color: "#ffb36b", background: "#fff8f0" }}
                >
                  <span className="text-2xl">📷</span>
                  <span>{totalImageCount}/5</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* 판매 상태 */}
          <div>
            <label className="goguma-label">판매 상태</label>
            <div className="flex gap-3 mt-1">
              {[
                { value: "available", label: "🟠 판매중" },
                { value: "sold", label: "✅ 판매완료" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: s.value }))}
                  className="flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all"
                  style={{
                    borderColor: form.status === s.value ? "#f97316" : "#ffd4a8",
                    background: form.status === s.value ? "#fff8f0" : "white",
                    color: form.status === s.value ? "#c2500a" : "#9ca3af",
                    boxShadow: form.status === s.value ? "2px 2px 0 #ffb36b" : "none",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="goguma-label">글 제목 *</label>
            <input
              type="text"
              name="title"
              className="goguma-input"
              value={form.title}
              onChange={handleChange}
              maxLength={50}
              required
            />
            <p className="text-xs mt-1 text-right" style={{ color: "#ffb36b" }}>
              {form.title.length}/50
            </p>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="goguma-label">카테고리 *</label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, category: cat.value }))}
                  className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border-2 text-xs font-medium transition-all"
                  style={{
                    borderColor: form.category === cat.value ? "#f97316" : "#ffd4a8",
                    background: form.category === cat.value ? "#fff8f0" : "white",
                    color: form.category === cat.value ? "#c2500a" : "#9ca3af",
                    boxShadow: form.category === cat.value ? "2px 2px 0 #ffb36b" : "none",
                  }}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span>{cat.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 가격 */}
          <div>
            <label className="goguma-label">가격 *</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                name="price"
                className="goguma-input pr-8"
                placeholder="0"
                value={form.price ? parseInt(form.price).toLocaleString() : ""}
                onChange={handlePriceChange}
                required
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold"
                style={{ color: "#ffb36b" }}
              >
                원
              </span>
            </div>
          </div>

          {/* 거래 지역 */}
          <div>
            <label className="goguma-label">거래 지역 *</label>
            <input
              type="text"
              name="location"
              className="goguma-input"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="goguma-label">자세한 설명 *</label>
            <textarea
              name="description"
              className="goguma-input resize-none"
              rows={5}
              value={form.description}
              onChange={handleChange}
              maxLength={1000}
              required
            />
            <p className="text-xs mt-1 text-right" style={{ color: "#ffb36b" }}>
              {form.description.length}/1000
            </p>
          </div>

          {error && (
            <div
              className="rounded-xl p-3 text-sm font-medium text-center"
              style={{ background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3" }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.back()}
              className="goguma-btn-outline flex-1 py-3"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="goguma-btn flex-1 py-3 text-base"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "저장 중... 🍠" : "저장하기 ✅"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
