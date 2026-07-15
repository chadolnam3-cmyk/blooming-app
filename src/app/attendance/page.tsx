"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AttendancePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const router = useRouter();

  const isValid = name.trim() !== "" && phone.trim().length === 4;

  const handleCheck = () => {
    if (!isValid) return;

    const members = JSON.parse(
      localStorage.getItem("members") || "[]"
    );

    const user = members.find(
      (m: any) => m.name === name && m.phone === phone
    );

    // ❌ 회원 없으면 가입으로 이동
    if (!user) {
      router.push("/join");
      return;
    }

    // 🌸 출석 기록 저장
    const records = JSON.parse(
      localStorage.getItem("attendance") || "[]"
    );

    records.push({
      name,
      phone,
      date: new Date().toISOString(),
    });

    localStorage.setItem("attendance", JSON.stringify(records));

    // 🌸 success 페이지 이동
    router.push("/success");
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-10 text-[#3F3F3F]">
      <div className="mx-auto max-w-md">

        {/* 헤더 */}
        <div className="text-center">
          <div className="text-3xl">🌱</div>
          <h1 className="text-4xl font-light text-[#7FAF8A]">
            Blooming
          </h1>
          <p className="text-xs tracking-[0.3em] text-[#B8A99A]">
            bloom every day
          </p>
        </div>

        {/* 입력 박스 */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          {/* 닉네임 */}
          <label className="text-sm text-[#666]">닉네임</label>
          <input
            className="mt-2 w-full rounded-2xl border px-4 py-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="닉네임 입력"
          />

          {/* 전화번호 */}
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

        </div>
      </div>
    </main>
  );
}