import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header
      style={{
        background: "white",
        borderBottom: "3px solid #ffb36b",
        boxShadow: "0 2px 0 #ffd4a8",
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.svg" alt="고구마마켓 로고" width={44} height={44} className="group-hover:animate-bounce" />
          <div className="leading-tight">
            <div className="font-black text-xl" style={{ color: "#c2500a" }}>
              고구마마켓
            </div>
            <div className="text-xs font-medium" style={{ color: "#ffb36b" }}>
              달콤한 중고거래
            </div>
          </div>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span
                className="text-sm font-medium hidden sm:block"
                style={{ color: "#c2500a" }}
              >
                👋 {user.email?.split("@")[0]}님
              </span>
              <Link href="/sell" className="goguma-btn text-sm py-2 px-4">
                + 팔기
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="goguma-btn-outline text-sm py-2 px-4"
              >
                로그인
              </Link>
              <Link href="/signup" className="goguma-btn text-sm py-2 px-4">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
