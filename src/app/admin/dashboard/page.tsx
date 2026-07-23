"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id?: string;
  name: string;
  phone: string;
  fullPhone?: string;
  experience?: string;
  memo?: string;
  createdAt?: string;
};

type AttendanceRecord = {
  name: string;
  phone: string;
  date: string;
  classTitle?: string;
};

const DEFAULT_MESSAGE = "몸은 천천히,\n변화는 자연스럽게.";

const DEFAULT_CLASS_TITLE = "허리와 골반 이완";

const DEFAULT_CLASS_CONTENT =
  "부드러운 호흡과 함께 골반과 허리를 천천히 풀어봅니다.";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [todayMessage, setTodayMessage] = useState(DEFAULT_MESSAGE);
  const [classTitle, setClassTitle] = useState(DEFAULT_CLASS_TITLE);
  const [classContent, setClassContent] = useState(DEFAULT_CLASS_CONTENT);

  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const isAuthenticated =
      sessionStorage.getItem("adminAuthenticated") === "true";

    if (!isAuthenticated) {
      router.replace("/admin");
      return;
    }

    setTodayMessage(
      localStorage.getItem("todayMessage") || DEFAULT_MESSAGE
    );

    setClassTitle(
      localStorage.getItem("classTitle") || DEFAULT_CLASS_TITLE
    );

    setClassContent(
      localStorage.getItem("classContent") ||
        DEFAULT_CLASS_CONTENT
    );

    try {
      const savedMembers = JSON.parse(
        localStorage.getItem("members") || "[]"
      );

      setMembers(Array.isArray(savedMembers) ? savedMembers : []);
    } catch {
      setMembers([]);
    }

    try {
      const savedAttendance = JSON.parse(
        localStorage.getItem("attendance") || "[]"
      );

      setAttendance(
        Array.isArray(savedAttendance) ? savedAttendance : []
      );
    } catch {
      setAttendance([]);
    }
  }, [router]);

  const saveMainInformation = () => {
  const trimmedMessage = todayMessage.trim();
  const trimmedTitle = classTitle.trim();
  const trimmedContent = classContent.trim();

  if (
    trimmedMessage === "" ||
    trimmedTitle === "" ||
    trimmedContent === ""
  ) {
    alert("오늘의 한마디와 수업 정보를 모두 입력해주세요.");
    return;
  }

  localStorage.setItem("todayMessage", trimmedMessage);
  localStorage.setItem("classTitle", trimmedTitle);
  localStorage.setItem("classContent", trimmedContent);

  setSavedMessage("메인화면에 저장되었습니다 🌸");

  window.setTimeout(() => {
    router.push("/");
  }, 800);
};

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    router.replace("/admin");
  };

  const todayKey = new Date().toLocaleDateString("ko-KR");

  const todayAttendance = attendance.filter((record) => {
    return (
      new Date(record.date).toLocaleDateString("ko-KR") ===
      todayKey
    );
  });
const getMemberAttendanceCount = (
  targetRecord: AttendanceRecord
) => {
  return attendance.filter((record) => {
    return (
      record.name === targetRecord.name &&
      record.phone === targetRecord.phone
    );
  }).length;
};
  const canSave =
    todayMessage.trim() !== "" &&
    classTitle.trim() !== "" &&
    classContent.trim() !== "";

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-8 text-[#3F3F3F]">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#7FAF8A]">Blooming</p>

            <h1 className="mt-1 text-3xl font-light">
              관리자 페이지
            </h1>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-xl border border-[#E8E1DA] bg-white px-4 py-2 text-sm"
            >
              메인화면
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#E8E1DA] bg-white px-4 py-2 text-sm text-[#777]"
            >
              로그아웃
            </button>
          </div>
        </header>

        <section className="mt-7 grid grid-cols-2 gap-4">
          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#777]">오늘 출석</p>

            <p className="mt-2 text-3xl font-medium text-[#7FAF8A]">
              {todayAttendance.length}명
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#777]">전체 회원</p>

            <p className="mt-2 text-3xl font-medium text-[#7FAF8A]">
              {members.length}명
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-medium">오늘의 한마디</h2>

          <p className="mt-2 text-sm text-[#888]">
            회원이 보는 메인화면 가장 위에 표시됩니다.
          </p>

          <textarea
            value={todayMessage}
            onChange={(event) =>
              setTodayMessage(event.target.value)
            }
            className="mt-4 h-28 w-full resize-none rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
            placeholder="회원에게 보여줄 오늘의 한마디를 적어주세요."
          />
        </section>

        <section className="mt-5 rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-medium">오늘의 수업</h2>

          <label className="mt-5 block text-sm text-[#666]">
            수업 주제
          </label>

          <input
            value={classTitle}
            onChange={(event) =>
              setClassTitle(event.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
            placeholder="예: 허리와 골반 이완"
          />

          <label className="mt-5 block text-sm text-[#666]">
            수업 내용
          </label>

          <textarea
            value={classContent}
            onChange={(event) =>
              setClassContent(event.target.value)
            }
            className="mt-2 h-32 w-full resize-none rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
            placeholder="오늘 진행할 수업 내용을 적어주세요."
          />

          <button
            type="button"
            onClick={saveMainInformation}
            disabled={!canSave}
            className={`mt-6 w-full rounded-2xl py-4 font-medium transition ${
              canSave
                ? "bg-[#7FAF8A] text-white active:scale-[0.98]"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            메인화면에 저장하기
          </button>

          {savedMessage && (
            <p className="mt-4 text-center text-sm text-[#7FAF8A]">
              {savedMessage}
            </p>
          )}
        </section>

        <section className="mt-5 rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-medium">관리 메뉴</h2>

          <div className="mt-4 grid gap-3">
            <Link
              href="/admin/members"
              className="flex items-center justify-between rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4"
            >
              <span>회원관리</span>
              <span className="text-[#7FAF8A]">›</span>
            </Link>

            <Link
              href="/admin/password"
              className="flex items-center justify-between rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4"
            >
              <span>비밀번호 변경</span>
              <span className="text-[#7FAF8A]">›</span>
            </Link>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-medium">오늘 출석 회원</h2>

          {todayAttendance.length === 0 ? (
            <p className="mt-4 text-sm text-[#999]">
              아직 오늘 출석한 회원이 없습니다.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {todayAttendance
                .slice()
                .reverse()
                .map((record, index) => (
                 <div
  key={`${record.date}-${index}`}
  className="rounded-2xl bg-[#FAF9F6] px-4 py-3"
>
  <div className="flex items-center gap-2">
    <p className="font-medium">{record.name}</p>

    {getMemberAttendanceCount(record) === 1 && (
      <span className="rounded-full bg-[#FDEAE3] px-2 py-1 text-[10px] font-medium text-[#D88072]">
        NEW
      </span>
    )}
  </div>

  <p className="mt-1 text-xs text-[#999]">
    {new Date(record.date).toLocaleTimeString(
      "ko-KR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}
  </p>
</div>
                ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}