"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerMember } from "@/lib/googleSheet";

const experiences = [
  { label: "🌱 처음이에요", message: "천천히 함께 시작해볼게요." },
  { label: "🌿 조금 해봤어요", message: "몸의 감각을 다시 깨워볼까요?" },
  { label: "🍃 꾸준히 하고 있어요", message: "오늘도 몸과 호흡에 집중해봐요." },
  { label: "🌸 오래 했어요", message: "오늘도 깊은 수련을 함께해요." },
];

export default function JoinPage() {
  const [name, setName] = useState("");
  const [phoneMiddle, setPhoneMiddle] = useState("");
  const [phoneLast, setPhoneLast] = useState("");
  const [selected, setSelected] = useState("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const isValid =
    name.trim() !== "" &&
    phoneMiddle.length === 4 &&
    phoneLast.length === 4 &&
    selected !== "";

const handleJoin = async () => {
  if (!isValid || isSubmitting) return;

  setIsSubmitting(true);

  try {
    const fullPhone = `010${phoneMiddle}${phoneLast}`;

    const result = await registerMember({
      name: name.trim(),
      phone: phoneLast,
      fullPhone,
      experience: selected,
      memo: memo.trim(),
    });

    if (result.alreadyExists) {
      alert("이미 등록된 회원입니다 🌿");
      router.push("/");
      return;
    }

    const savedMembers = JSON.parse(
      localStorage.getItem("members") || "[]"
    );

    const members = Array.isArray(savedMembers)
      ? savedMembers
      : [];

    const alreadySavedLocally = members.some(
      (member: any) =>
        member.name === result.member.name &&
        member.phone === result.member.phone
    );

    if (!alreadySavedLocally) {
      members.push(result.member);

      localStorage.setItem(
        "members",
        JSON.stringify(members)
      );
    }

    alert("회원가입이 완료되었습니다 🌸");

    router.push("/");
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "회원가입 중 오류가 발생했습니다."
    );
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-8 text-[#3F3F3F]">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm font-medium text-[#7FAF8A]">
          ← 출석화면으로
        </Link>

        <section className="mt-6 rounded-[32px] bg-white p-7 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center">
              <div className="relative h-12 w-10">
                <div className="absolute left-1/2 top-5 h-7 w-[3px] -translate-x-1/2 rounded-full bg-[#5F8568]" />
                <div className="absolute left-[4px] top-1 h-6 w-8 -rotate-35 rounded-[100%_0] border-2 border-[#5F8568]" />
                <div className="absolute right-[4px] top-1 h-6 w-8 rotate-35 rounded-[0_100%] border-2 border-[#5F8568]" />
              </div>
            </div>

            <p className="text-5xl font-light tracking-wide text-[#7FAF8A]">
              Blooming
            </p>

            <p className="mt-2 text-xs tracking-[0.35em] text-[#D8A48F]">
              bloom every day
            </p>
          </div>

          <div className="mt-9 text-center">
            <h1 className="text-2xl font-light">
              처음 오신 것을 환영합니다 🌸
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-[#777]">
              출석을 위해 간단한 정보를 입력해주세요.
            </p>
          </div>

          <div className="mt-8">
            <label className="text-sm text-[#555]">닉네임</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
              placeholder="편하게 입력해주세요"
            />
          </div>

          <div className="mt-5">
            <label className="text-sm text-[#555]">전화번호</label>

            <div className="mt-2 grid grid-cols-[86px_1fr_1fr] gap-2">
              <div className="flex items-center justify-center rounded-2xl border border-[#E8E1DA] bg-[#F2EFEA] px-3 py-4 text-base">
                010 -
              </div>

              <input
                value={phoneMiddle}
                onChange={(e) =>
                  setPhoneMiddle(e.target.value.replace(/\D/g, ""))
                }
                className="min-w-0 rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
              />

              <input
                value={phoneLast}
                onChange={(e) =>
                  setPhoneLast(e.target.value.replace(/\D/g, ""))
                }
                className="min-w-0 rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
                inputMode="numeric"
                maxLength={4}
                placeholder="5678"
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-[#555]">요가 경험</p>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {experiences.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelected(item.label)}
                  className={`rounded-2xl border px-4 py-4 text-left transition active:scale-[0.98] ${
                    selected === item.label
                      ? "border-[#7FAF8A] bg-[#F1F8F3]"
                      : "border-[#E8E1DA] bg-[#FAF9F6]"
                  }`}
                >
                  <div className="font-medium">{item.label}</div>

                  <div className="mt-2 text-xs leading-relaxed text-[#777]">
                    {item.message}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm text-[#555]">특이사항</label>

            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="mt-2 h-32 w-full resize-none rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
              placeholder="예) 허리디스크, 임신 24주, 어깨 통증, 손목이 약함"
            />
          </div>

          <button
            type="button"
            onClick={handleJoin}
            disabled={!isValid || isSubmitting}
            className={`mt-7 w-full rounded-2xl py-4 text-lg font-medium transition active:scale-[0.98] ${
              isValid && !isSubmitting
                ? "bg-[#7FAF8A] text-white"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            {isSubmitting ? "가입 처리 중..." : "가입하기"}
          </button>

          <p className="mt-4 text-center text-xs leading-relaxed text-[#999]">
            입력하신 정보는
            <br />
            수업 진행 및 출석 확인을 위해서만 사용됩니다.
          </p>
        </section>
      </div>
    </main>
  );
}