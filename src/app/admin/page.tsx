"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const isValid = password.trim() !== "";

  const handleLogin = () => {
    if (!isValid) return;

    const savedPassword =
      localStorage.getItem("adminPassword") || "1234";

    if (password === savedPassword) {
      sessionStorage.setItem("adminAuthenticated", "true");
      router.push("/admin/dashboard");
      return;
    }

    setErrorMessage("비밀번호가 올바르지 않습니다.");

    window.setTimeout(() => {
      setErrorMessage("");
    }, 1500);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-5 text-[#3F3F3F]">
      <section className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-sm">
        <div className="text-center">
          <p className="text-sm text-[#7FAF8A]">Blooming</p>

          <h1 className="mt-2 text-3xl font-light">
            관리자 로그인
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[#888]">
            관리자 비밀번호를 입력해주세요.
          </p>
        </div>

        <div className="mt-8">
          <label className="text-sm text-[#666]">
            비밀번호
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrorMessage("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleLogin();
              }
            }}
            className="mt-2 w-full rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
            placeholder="비밀번호 입력"
            autoFocus
          />
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={!isValid}
          className={`mt-6 w-full rounded-2xl py-4 font-medium transition ${
            isValid
              ? "bg-[#7FAF8A] text-white active:scale-[0.98]"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
        >
          관리자 화면으로 이동
        </button>

        {errorMessage && (
          <p className="mt-4 text-center text-sm text-[#D88072]">
            {errorMessage}
          </p>
        )}

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-[#7FAF8A]"
        >
          ← 메인화면으로
        </Link>
      </section>
    </main>
  );
}