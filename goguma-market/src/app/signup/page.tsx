"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== passwordConfirm) {
      setMessage({ type: "error", text: "비밀번호가 일치하지 않아요! 🥺" });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "비밀번호는 6자 이상이어야 해요!" });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "📧 이메일을 확인해주세요! 인증 링크를 보냈어요.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-10">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍠</div>
          <h1 className="text-2xl font-black" style={{ color: "#c2500a" }}>
            고구마마켓 가입하기
          </h1>
          <p className="text-sm mt-2" style={{ color: "#ffb36b" }}>
            달콤한 거래를 시작해봐요!
          </p>
        </div>

        {/* 카드 */}
        <div className="goguma-card p-7">
          <form onSubmit={handleSignup} className="flex flex-col gap-5">
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
                placeholder="6자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="goguma-label">비밀번호 확인</label>
              <input
                type="password"
                className="goguma-input"
                placeholder="비밀번호를 한 번 더 입력하세요"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>

            {message && (
              <div
                className="rounded-xl p-3 text-sm font-medium text-center"
                style={{
                  background: message.type === "success" ? "#f0fdf4" : "#fff1f2",
                  color: message.type === "success" ? "#166534" : "#be123c",
                  border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecdd3"}`,
                }}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="goguma-btn w-full py-3 text-base mt-1"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "가입 중... 🍠" : "회원가입하기 🎉"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm" style={{ color: "#ea6a0a" }}>
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-bold underline"
              style={{ color: "#c2500a" }}
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
