"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [todayMessage, setTodayMessage] = useState(
    "몸은 천천히,\n변화는 자연스럽게."
  );

  const [classTitle, setClassTitle] = useState(
    "허리와 골반 이완"
  );

  const [classContent, setClassContent] = useState(
    "부드러운 호흡과 함께 골반과 허리를 천천히 풀어봅니다."
  );

  const router = useRouter();

  useEffect(() => {
    const savedMessage = localStorage.getItem("todayMessage");
    const savedClassTitle = localStorage.getItem("classTitle");
    const savedClassContent = localStorage.getItem("classContent");

    if (savedMessage) {
      setTodayMessage(savedMessage);
    }

    if (savedClassTitle) {
      setClassTitle(savedClassTitle);
    }

    if (savedClassContent) {
      setClassContent(savedClassContent);
    }
  }, []);

  const isValid =
    name.trim() !== "" &&
    phone.trim().length === 4;

const handleCheck = () => {
  if (!isValid) return;

  let members: any[] = [];

  try {
    const savedMembers = JSON.parse(
      localStorage.getItem("members") || "[]"
    );

    members = Array.isArray(savedMembers)
      ? savedMembers
      : [];
  } catch {
    members = [];
  }

  const normalizedName = name.trim();
  const normalizedPhone = phone.trim();

  const user = members.find(
    (member: any) =>
      member.name?.trim() === normalizedName &&
      member.phone === normalizedPhone
  );

  if (!user) {
    router.push("/join");
    return;
  }

  let attendanceRecords: any[] = [];

  try {
    const savedAttendance = JSON.parse(
      localStorage.getItem("attendance") || "[]"
    );

    attendanceRecords = Array.isArray(savedAttendance)
      ? savedAttendance
      : [];
  } catch {
    attendanceRecords = [];
  }

  const today = new Date().toLocaleDateString("ko-KR");

  const alreadyAttended = attendanceRecords.some(
    (record: any) => {
      const sameMember =
        record.memberId === user.id ||
        (record.name === user.name &&
          record.phone === user.phone);

      const sameDay =
        new Date(record.date).toLocaleDateString("ko-KR") ===
        today;

      return sameMember && sameDay;
    }
  );

  if (alreadyAttended) {
    alert("오늘 이미 출석하셨습니다 🌿");
    setName("");
    setPhone("");
    return;
  }

  attendanceRecords.push({
    memberId: user.id || "",
    name: user.name,
    phone: user.phone,
    date: new Date().toISOString(),
    classTitle,
  });

  localStorage.setItem(
    "attendance",
    JSON.stringify(attendanceRecords)
  );

  router.push("/success");
};

  return (
    <main className="relative min-h-screen bg-[#FAF9F6] px-5 text-[#3F3F3F]">
      <div className="mx-auto max-w-md">
        <Header />

        {/* 오늘의 한마디 */}
        <section className="rounded-[28px] bg-white/80 p-6 shadow-sm">
          <p className="text-sm text-[#7FAF8A]">
            오늘의 한마디
          </p>

          <p className="mt-3 whitespace-pre-line text-2xl leading-relaxed">
            {todayMessage}
          </p>
        </section>

        {/* 오늘의 수업 */}
        <section className="mt-5 rounded-[28px] bg-white/80 p-6 shadow-sm">
          <p className="text-sm text-[#D8A48F]">
            오늘의 수업
          </p>

          <h1 className="mt-3 text-2xl font-medium">
            {classTitle}
          </h1>

          <p className="mt-3 whitespace-pre-line leading-relaxed text-[#666]">
            {classContent}
          </p>
        </section>

        {/* 출석 */}
        <section className="mt-5 rounded-[28px] bg-white p-6 shadow-sm">
          <label className="text-sm text-[#666]">
            닉네임
          </label>

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

          <button
            onClick={handleCheck}
            disabled={!isValid}
            className={`mt-6 w-full rounded-2xl py-4 font-medium transition ${
              isValid
                ? "bg-[#7FAF8A] text-white"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            출석하기
          </button>
        </section>

        {/* 회원가입 + admin */}
        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[#777]">
          <span>처음 오셨나요?</span>

          <Link
            href="/join"
            className="font-medium text-[#7FAF8A]"
          >
            회원가입
          </Link>

          <Link
            href="/admin"
            className="text-xs text-[#7FAF8A]/10 transition hover:text-[#7FAF8A]/50"
          >
            admin
          </Link>
        </div>
      </div>
    </main>
  );
}