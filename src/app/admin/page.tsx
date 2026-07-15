"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("attendance") || "[]"
    );
    setRecords(data);
  }, []);

  // 🌸 로그인 (간단 관리자 비번)
  if (!isAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="bg-white p-6 rounded-2xl shadow-sm w-full max-w-sm">
          <h1 className="text-xl text-center text-[#7FAF8A] mb-4">
            관리자 로그인 🌿
          </h1>

          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />

          <button
            onClick={() => {
              if (password === "1234") {
                setIsAuth(true);
              } else {
                alert("비밀번호 틀림 ❌");
              }
            }}
            className="mt-4 w-full bg-[#7FAF8A] text-white py-3 rounded-xl"
          >
            로그인
          </button>
        </div>
      </main>
    );
  }

  // 🌸 필터 데이터
  const today = new Date().toDateString();

  const filteredRecords =
    filter === "today"
      ? records.filter(
          (r) => new Date(r.date).toDateString() === today
        )
      : records;

  // 🌸 회원별 출석 횟수
  const countMap: Record<string, number> = {};
  records.forEach((r) => {
    countMap[r.name] = (countMap[r.name] || 0) + 1;
  });

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-10 text-[#3F3F3F]">
      <div className="mx-auto max-w-md">

        {/* 타이틀 */}
        <h1 className="text-3xl text-center text-[#7FAF8A]">
          관리자 페이지 🌿
        </h1>

        {/* 필터 버튼 */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-2 rounded-xl ${
              filter === "all"
                ? "bg-[#7FAF8A] text-white"
                : "bg-white"
            }`}
          >
            전체
          </button>

          <button
            onClick={() => setFilter("today")}
            className={`flex-1 py-2 rounded-xl ${
              filter === "today"
                ? "bg-[#7FAF8A] text-white"
                : "bg-white"
            }`}
          >
            오늘
          </button>
        </div>

        {/* 통계 */}
        <div className="mt-5 bg-white rounded-2xl p-5 shadow-sm">
          <p>총 출석</p>
          <p className="text-2xl text-[#7FAF8A]">
            {filteredRecords.length}명
          </p>
        </div>

        {/* 회원별 출석 */}
        <div className="mt-5 bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-medium mb-2">
            회원별 출석 횟수
          </h2>

          {Object.keys(countMap).map((name) => (
            <div key={name} className="flex justify-between py-1">
              <span>{name}</span>
              <span className="text-[#7FAF8A] font-medium">
                {countMap[name]}회
              </span>
            </div>
          ))}
        </div>

        {/* 리스트 */}
        <div className="mt-5 space-y-3">
          {filteredRecords.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-[#777]">
                📱 {item.phone}
              </p>
              <p className="text-xs text-[#aaa] mt-1">
                {new Date(item.date).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}