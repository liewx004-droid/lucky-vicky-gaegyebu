"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError("이메일 또는 비밀번호가 틀렸어요! 🥺");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-10">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍠</div>
          <h1 className="text-2xl font-black" style={{ color: "#c2500a" }}>
            다시 돌아오셨군요!
          </h1>
          <p className="text-sm mt-2" style={{ color: "#ffb36b" }}>
            로그인하고 거래를 계속해요 ✨
          </p>
        </div>

        {/* 카드 */}
        <div className="goguma-card p-7">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="goguma-label">이메일</label>
              <input
                type="email"
                className="goguma-input"
                placeholder="hello@goguma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="goguma-label">비밀번호</label>
              <input
                type="password"
                className="goguma-input"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div
                className="rounded-xl p-3 text-sm font-medium text-center"
                style={{
                  background: "#fff1f2",
                  color: "#be123c",
                  border: "1px solid #fecdd3",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="goguma-btn w-full py-3 text-base mt-1"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "로그인 중... 🍠" : "로그인하기 🔑"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm" style={{ color: "#ea6a0a" }}>
            아직 계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-bold underline"
              style={{ color: "#c2500a" }}
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
