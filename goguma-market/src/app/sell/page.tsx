"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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

export default function SellPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    price: "",
    location: "",
    description: "",
  });

  // 미리보기용 이미지 목록 (File 객체 + 로컬 URL)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
    setForm((prev) => ({ ...prev, price: onlyNumbers }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (imageFiles.length + files.length > 5) {
      setError("사진은 최대 5장까지 올릴 수 있어요!");
      return;
    }
    setError(null);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    // 같은 파일 다시 선택할 수 있도록 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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

    if (!user) {
      router.push("/login");
      return;
    }

    // 이미지를 Storage에 업로드하고 URL 목록 수집
    const uploadedUrls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file);

      if (uploadError) {
        setError("이미지 업로드 중 오류가 생겼어요. 다시 시도해주세요.");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
      uploadedUrls.push(urlData.publicUrl);
    }

    const { error: insertError } = await supabase.from("products").insert({
      user_id: user.id,
      title: form.title,
      category: form.category,
      price: parseInt(form.price),
      location: form.location,
      description: form.description,
      images: uploadedUrls,
    });

    setLoading(false);

    if (insertError) {
      setError("저장 중 오류가 생겼어요. 다시 시도해주세요.");
      console.error(insertError);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "#c2500a" }}>
          🍠 판매글 작성
        </h1>
        <p className="text-sm mt-1" style={{ color: "#ffb36b" }}>
          팔고 싶은 물건을 등록해봐요!
        </p>
      </div>

      <div className="goguma-card p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* 사진 업로드 */}
          <div>
            <label className="goguma-label">사진 (최대 5장)</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2" style={{ borderColor: "#ffd4a8" }}>
                  <Image src={src} alt={`미리보기 ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {imageFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-xs font-medium gap-1 transition-colors"
                  style={{ borderColor: "#ffd4a8", color: "#ffb36b", background: "#fff8f0" }}
                >
                  <span className="text-2xl">📷</span>
                  <span>{imageFiles.length}/5</span>
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
            <p className="text-xs mt-1" style={{ color: "#ffb36b" }}>
              첫 번째 사진이 대표 사진으로 표시돼요. JPG, PNG, WEBP 가능 (장당 최대 5MB)
            </p>
          </div>

          {/* 제목 */}
          <div>
            <label className="goguma-label">글 제목 *</label>
            <input
              type="text"
              name="title"
              className="goguma-input"
              placeholder="예) 거의 새 상품 에어팟 팔아요"
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
              placeholder="예) 강남구 역삼동"
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
              placeholder="물건 상태, 구매 시기, 파는 이유 등을 적어주세요."
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
              {loading ? "올리는 중... 🍠" : "등록하기 ✅"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
