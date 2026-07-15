"use client";

import { useState } from "react";

export default function ClassPage() {
  const [quote, setQuote] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-10 text-[#3F3F3F]">
      <div className="mx-auto max-w-md">

        {/* 로고 */}
        <div className="text-center">
          <div className="text-3xl">🌱</div>
          <h1 className="text-4xl font-light text-[#7FAF8A]">
            Blooming
          </h1>
        </div>

        {/* 폼 */}
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">

          <label className="text-sm">오늘의 한마디</label>
          <input
            className="mt-2 w-full rounded-xl border px-4 py-3"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
          />

          <label className="mt-4 text-sm">수업 주제</label>
          <input
            className="mt-2 w-full rounded-xl border px-4 py-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="mt-4 text-sm">수업 내용</label>
          <textarea
            className="mt-2 w-full rounded-xl border px-4 py-3 h-32"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button
  onClick={() => {
    localStorage.setItem("quote", quote);
    localStorage.setItem("title", title);
    localStorage.setItem("content", content);
    alert("저장되었습니다 🌸");
  }}
  className="mt-6 w-full rounded-xl bg-[#7FAF8A] py-4 text-white"
>
  저장하기
</button>
        </div>
      </div>
    </main>
  );
}