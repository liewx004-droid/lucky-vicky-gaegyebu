import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* 히어로 섹션 */}
      <section className="text-center py-12">
        <div className="mb-4 inline-block">
          <Image src="/logo.svg" alt="고구마마켓" width={120} height={120} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black mb-4" style={{ color: "#c2500a" }}>
          고구마마켓
        </h1>
        <p className="text-lg font-medium mb-2" style={{ color: "#ea6a0a" }}>
          우리 동네 달콤한 중고거래 ✨
        </p>
        <p className="text-sm mb-8" style={{ color: "#ffb36b" }}>
          필요 없는 물건은 팔고, 갖고 싶은 건 사고!
        </p>
        {!user ? (
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup" className="goguma-btn text-base px-8 py-3">
              🎉 지금 시작하기
            </Link>
            <Link href="/login" className="goguma-btn-outline text-base px-8 py-3">
              로그인
            </Link>
          </div>
        ) : (
          <Link href="/sell" className="goguma-btn text-base px-8 py-3">
            🍠 판매글 올리기
          </Link>
        )}
      </section>

      {/* 상품 목록 */}
      <section className="mt-6">
        <h2 className="text-2xl font-black mb-6" style={{ color: "#c2500a" }}>
          🍠 최근 올라온 물건들
        </h2>

        {!products || products.length === 0 ? (
          <div className="goguma-card p-12 text-center">
            <div className="text-5xl mb-4">🥺</div>
            <p className="font-bold text-lg mb-1" style={{ color: "#c2500a" }}>
              아직 올라온 물건이 없어요
            </p>
            <p className="text-sm mb-6" style={{ color: "#ffb36b" }}>
              첫 번째 판매자가 되어보세요!
            </p>
            {user ? (
              <Link href="/sell" className="goguma-btn px-6 py-2">판매글 올리기</Link>
            ) : (
              <Link href="/signup" className="goguma-btn px-6 py-2">가입하고 시작하기</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="goguma-card p-4 hover:-translate-y-1 transition-transform block"
              >
                <div
                  className="rounded-xl overflow-hidden flex items-center justify-center text-3xl mb-3 relative"
                  style={{ background: "#fff8f0", height: "100px" }}
                >
                  {product.images?.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    getCategoryEmoji(product.category)
                  )}
                </div>
                <p className="font-bold text-sm text-gray-800 truncate">{product.title}</p>
                <p className="font-black text-base mt-1" style={{ color: "#c2500a" }}>
                  {product.price.toLocaleString()}원
                </p>
                <p className="text-xs text-gray-400 mt-1">📍 {product.location}</p>
                <span
                  className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "#fff8f0", color: "#ea6a0a", border: "1px solid #ffd4a8" }}
                >
                  {product.category}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
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
