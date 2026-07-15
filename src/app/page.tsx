"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const isValid = name.trim() !== "" && phone.trim().length === 4;

  const handleCheck = () => {
    // 🚨 입력 체크 먼저
    if (!isValid) return;

    const members = JSON.parse(
      localStorage.getItem("members") || "[]"
    );

    const user = members.find(
      (m: any) => m.name === name && m.phone === phone
    );

    // ❌ 없으면 가입으로 이동
    if (!user) {
      router.push("/join");
      return;
    }

    // ✅ 있으면 success로 이동
    router.push("/success");
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 text-[#3F3F3F] relative">
      <div className="mx-auto max-w-md">
        <Header />

        {/* 오늘의 한마디 */}
        <section className="rounded-[28px] bg-white/80 p-6 shadow-sm">
          <p className="text-sm text-[#7FAF8A]">오늘의 한마디</p>
          <p className="mt-3 text-2xl leading-relaxed">
            몸은 천천히,
            <br />
            변화는 자연스럽게.
          </p>
        </section>

        {/* 오늘의 수업 */}
        <section className="mt-5 rounded-[28px] bg-white/80 p-6 shadow-sm">
          <p className="text-sm text-[#D8A48F]">오늘의 수업</p>
          <h1 className="mt-3 text-2xl font-medium">
            허리와 골반 이완
          </h1>
          <p className="mt-3 leading-relaxed text-[#666]">
            부드러운 호흡과 함께 골반과 허리를 천천히 풀어봅니다.
          </p>
        </section>

        {/* 출석 */}
        <section className="mt-5 rounded-[28px] bg-white p-6 shadow-sm">
          <label className="text-sm text-[#666]">닉네임</label>
          <input
            className="mt-2 w-full rounded-2xl border px-4 py-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="닉네임"
          />

          <label className="mt-5 block text-sm text-[#666]">
            전화번호 뒷 4자리
          </label>
          <input
            className="mt-2 w-full rounded-2xl border px-4 py-4"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={4}
            placeholder="1234"
          />

          {/* 출석 버튼 */}
          <button
            onClick={handleCheck}
            disabled={!isValid}
            className={`mt-6 w-full rounded-2xl py-4 font-medium transition
              ${
                isValid
                  ? "bg-[#7FAF8A] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            출석하기
          </button>

        </section>

        {/* 회원가입 + admin */}
        <div className="mt-5 flex items-center justify-center text-sm text-[#777] gap-2">
          <span>처음 오셨나요?</span>

          <Link href="/join" className="text-[#7FAF8A] font-medium">
            회원가입
          </Link>

          <Link
            href="/admin"
            className="text-xs text-[#7FAF8A]/10 hover:text-[#7FAF8A]/50 transition"
          >
            admin
          </Link>
        </div>
      </div>
    </main>
  );
}