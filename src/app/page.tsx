"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addAttendance,
  checkMember,
  getMainSettings,
} from "@/lib/googleSheet";
export default function Home() {
const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [isChecking, setIsChecking] = useState(false);

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
  const loadMainSettings = async () => {
    try {
      const settings = await getMainSettings();

      setTodayMessage(
        settings.todayMessage ||
          "몸은 천천히,\n변화는 자연스럽게."
      );

      setClassTitle(
        settings.classTitle ||
          "허리와 골반 이완"
      );

      setClassContent(
        settings.classContent ||
          "부드러운 호흡과 함께 골반과 허리를 천천히 풀어봅니다."
      );
    } catch (error) {
      console.error(
        "메인화면 설정 불러오기 실패:",
        error
      );
    }
  };

  loadMainSettings();
}, []);
  const isValid =
    name.trim() !== "" &&
    phone.trim().length === 4;

const handleCheck = async () => {
  if (!isValid || isChecking) return;

  setIsChecking(true);

  try {
    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();

    // 구글시트에서 회원 확인
    const memberResult = await checkMember(
      normalizedName,
      normalizedPhone
    );

    // 회원이 없으면 회원가입 화면으로 이동
    if (!memberResult.found || !memberResult.member) {
      alert("등록된 회원을 찾을 수 없습니다 🌿");
      router.push("/join");
      return;
    }

    const member = memberResult.member;

    // 구글시트에 출석 기록 저장
    const attendanceResult = await addAttendance({
      memberId: member.id || "",
      name: member.name,
      phone: member.phone,
      classTitle,
    });

    // 오늘 이미 출석한 회원
    if (attendanceResult.alreadyAttended) {
      alert("오늘 이미 출석하셨습니다 🌿");
      setName("");
      setPhone("");
      return;
    }

    if (!attendanceResult.attended) {
      throw new Error("출석을 저장하지 못했습니다.");
    }

    router.push("/success");
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "출석 처리 중 오류가 발생했습니다."
    );
  } finally {
    setIsChecking(false);
  }
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
  type="button"
  onClick={handleCheck}
  disabled={!isValid || isChecking}
  className={`mt-6 w-full rounded-2xl py-4 font-medium transition ${
    isValid && !isChecking
      ? "bg-[#7FAF8A] text-white active:scale-[0.98]"
      : "cursor-not-allowed bg-gray-300 text-gray-500"
  }`}
>
  {isChecking ? "출석 확인 중..." : "출석하기"}
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