"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cancelAttendance,
  getDashboardData,
  saveMainSettings,
  type AttendanceRecord,
  type Member,
} from "@/lib/googleSheet";

const DEFAULT_MESSAGE =
  "몸은 천천히,\n변화는 자연스럽게.";

const DEFAULT_CLASS_TITLE = "허리와 골반 이완";

const DEFAULT_CLASS_CONTENT =
  "부드러운 호흡과 함께 골반과 허리를 천천히 풀어봅니다.";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [todayMessage, setTodayMessage] =
    useState(DEFAULT_MESSAGE);

  const [classTitle, setClassTitle] =
    useState(DEFAULT_CLASS_TITLE);

  const [classContent, setClassContent] =
    useState(DEFAULT_CLASS_CONTENT);

  const [members, setMembers] = useState<Member[]>([]);

  const [attendance, setAttendance] = useState<
    AttendanceRecord[]
  >([]);

  const [savedMessage, setSavedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const isAuthenticated =
      sessionStorage.getItem("adminAuthenticated") ===
      "true";

    if (!isAuthenticated) {
      router.replace("/admin");
      return;
    }

    loadDashboard();
  }, [router]);

  const loadDashboard = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getDashboardData();

      setMembers(
        Array.isArray(data.members)
          ? data.members
          : []
      );

      setAttendance(
        Array.isArray(data.attendance)
          ? data.attendance
          : []
      );

      if (data.settings) {
        setTodayMessage(
          data.settings.todayMessage ||
            DEFAULT_MESSAGE
        );

        setClassTitle(
          data.settings.classTitle ||
            DEFAULT_CLASS_TITLE
        );

        setClassContent(
          data.settings.classContent ||
            DEFAULT_CLASS_CONTENT
        );
      }
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "관리자 정보를 불러오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const saveMainInformation = async () => {
    const trimmedMessage = todayMessage.trim();
    const trimmedTitle = classTitle.trim();
    const trimmedContent = classContent.trim();

    if (
      trimmedMessage === "" ||
      trimmedTitle === "" ||
      trimmedContent === ""
    ) {
      alert(
        "오늘의 한마디와 수업 정보를 모두 입력해주세요."
      );

      return;
    }

    if (isSaving) return;

    setIsSaving(true);

    try {
      const result = await saveMainSettings({
        todayMessage: trimmedMessage,
        classTitle: trimmedTitle,
        classContent: trimmedContent,
      });

      setTodayMessage(result.todayMessage);
      setClassTitle(result.classTitle);
      setClassContent(result.classContent);

      setSavedMessage(
        "구글시트와 메인화면에 저장되었습니다 🌸"
      );

      window.setTimeout(() => {
        setSavedMessage("");
      }, 1500);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(
      "adminAuthenticated"
    );

    router.replace("/admin");
  };

  const handleCancelAttendance = async (
    targetRecord: AttendanceRecord
  ) => {
    const confirmed = window.confirm(
      `${targetRecord.name} 회원의 출석을 취소할까요?`
    );

    if (!confirmed) return;

    try {
      const result = await cancelAttendance(
        targetRecord
      );

      if (!result.cancelled) {
        alert(
          "출석 기록을 찾지 못했습니다."
        );

        return;
      }

      setAttendance((currentAttendance) =>
        currentAttendance.filter(
          (record) =>
            !(
              record.name === targetRecord.name &&
              String(record.phone) ===
                String(targetRecord.phone) &&
              String(record.date) ===
                String(targetRecord.date)
            )
        )
      );

      alert("출석이 취소되었습니다.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "출석 취소 중 오류가 발생했습니다."
      );
    }
  };

  const todayKey =
    new Date().toLocaleDateString("ko-KR");

  const todayAttendance = attendance.filter(
    (record) => {
      const recordDate = new Date(record.date);

      if (
        Number.isNaN(recordDate.getTime())
      ) {
        return false;
      }

      return (
        recordDate.toLocaleDateString(
          "ko-KR"
        ) === todayKey
      );
    }
  );

  const now = new Date();

  const monthlyAttendance =
    attendance.filter((record) => {
      const attendanceDate = new Date(
        record.date
      );

      if (
        Number.isNaN(
          attendanceDate.getTime()
        )
      ) {
        return false;
      }

      return (
        attendanceDate.getFullYear() ===
          now.getFullYear() &&
        attendanceDate.getMonth() ===
          now.getMonth()
      );
    });

  const rankingMap = attendance.reduce<
    Record<
      string,
      {
        name: string;
        phone: string;
        count: number;
      }
    >
  >((result, record) => {
    const key = `${record.name}-${record.phone}`;

    if (!result[key]) {
      result[key] = {
        name: record.name,
        phone: String(record.phone),
        count: 0,
      };
    }

    result[key].count += 1;

    return result;
  }, {});

  const topFiveMembers =
    Object.values(rankingMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

  const getMemberAttendanceCount = (
    targetRecord: AttendanceRecord
  ) => {
    return attendance.filter(
      (record) =>
        record.name === targetRecord.name &&
        String(record.phone) ===
          String(targetRecord.phone)
    ).length;
  };

  const formatDateTime = (
    date: string
  ) => {
    const parsedDate = new Date(date);

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      return "시간 정보 없음";
    }

    return parsedDate.toLocaleString(
      "ko-KR",
      {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  };

  const canSave =
    todayMessage.trim() !== "" &&
    classTitle.trim() !== "" &&
    classContent.trim() !== "";

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <p className="text-[#7FAF8A]">
          관리자 정보를 불러오는 중...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-8 text-[#3F3F3F]">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#7FAF8A]">
              Blooming
            </p>

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

        {errorMessage && (
          <section className="mt-6 rounded-[24px] bg-white p-5 text-center shadow-sm">
            <p className="text-sm text-[#D88072]">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-4 rounded-xl bg-[#7FAF8A] px-5 py-3 text-sm text-white"
            >
              다시 불러오기
            </button>
          </section>
        )}

        <section className="mt-7 grid grid-cols-2 gap-4">
          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#777]">
              오늘 출석
            </p>

            <p className="mt-2 text-3xl font-medium text-[#7FAF8A]">
              {todayAttendance.length}명
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#777]">
              전체 회원
            </p>

            <p className="mt-2 text-3xl font-medium text-[#7FAF8A]">
              {members.length}명
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#777]">
              이번 달 출석
            </p>

            <p className="mt-2 text-3xl font-medium text-[#D8A48F]">
              {monthlyAttendance.length}회
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#777]">
              누적 출석
            </p>

            <p className="mt-2 text-3xl font-medium text-[#D8A48F]">
              {attendance.length}회
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-medium">
            오늘의 한마디
          </h2>

          <p className="mt-2 text-sm text-[#888]">
            회원이 보는 메인화면 가장 위에
            표시됩니다.
          </p>

          <textarea
            value={todayMessage}
            onChange={(event) =>
              setTodayMessage(
                event.target.value
              )
            }
            className="mt-4 h-28 w-full resize-none rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
          />
        </section>

        <section className="mt-5 rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-medium">
            오늘의 수업
          </h2>

          <label className="mt-5 block text-sm text-[#666]">
            수업 주제
          </label>

          <input
            value={classTitle}
            onChange={(event) =>
              setClassTitle(
                event.target.value
              )
            }
            className="mt-2 w-full rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
          />

          <label className="mt-5 block text-sm text-[#666]">
            수업 내용
          </label>

          <textarea
            value={classContent}
            onChange={(event) =>
              setClassContent(
                event.target.value
              )
            }
            className="mt-2 h-32 w-full resize-none rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
          />

          <button
            type="button"
            onClick={saveMainInformation}
            disabled={
              !canSave || isSaving
            }
            className={`mt-6 w-full rounded-2xl py-4 font-medium transition ${
              canSave && !isSaving
                ? "bg-[#7FAF8A] text-white active:scale-[0.98]"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            {isSaving
              ? "저장 중..."
              : "메인화면에 저장하기"}
          </button>

          {savedMessage && (
            <p className="mt-4 text-center text-sm text-[#7FAF8A]">
              {savedMessage}
            </p>
          )}
        </section>

        <section className="mt-5 rounded-[28px] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium">
                출석 TOP 5
              </h2>

              <p className="mt-2 text-sm text-[#888]">
                누적 출석 횟수가 많은
                회원입니다.
              </p>
            </div>

            <span className="text-2xl">
              🏆
            </span>
          </div>

          {topFiveMembers.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-[#FAF9F6] px-4 py-4 text-sm text-[#999]">
              아직 출석 기록이 없습니다.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {topFiveMembers.map(
                (member, index) => (
                  <div
                    key={`${member.name}-${member.phone}`}
                    className="flex items-center justify-between rounded-2xl bg-[#FAF9F6] px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-medium">
                          {member.name}
                        </p>

                        <p className="mt-1 text-xs text-[#999]">
                          전화번호 뒷자리{" "}
                          {member.phone}
                        </p>
                      </div>
                    </div>

                    <p className="font-medium text-[#7FAF8A]">
                      {member.count}회
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="mt-5 rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-medium">
            관리 메뉴
          </h2>

          <div className="mt-4 grid gap-3">
            <Link
              href="/admin/members"
              className="flex items-center justify-between rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4"
            >
              <span>회원관리</span>
              <span className="text-[#7FAF8A]">
                ›
              </span>
            </Link>

            <Link
              href="/admin/password"
              className="flex items-center justify-between rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4"
            >
              <span>비밀번호 변경</span>
              <span className="text-[#7FAF8A]">
                ›
              </span>
            </Link>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-medium">
            오늘 출석 회원
          </h2>

          {todayAttendance.length === 0 ? (
            <p className="mt-4 text-sm text-[#999]">
              아직 오늘 출석한 회원이 없습니다.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {todayAttendance
                .slice()
                .reverse()
                .map(
                  (record, index) => (
                    <div
                      key={`${record.date}-${index}`}
                      className="rounded-2xl bg-[#FAF9F6] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {record.name}
                            </p>

                            {getMemberAttendanceCount(
                              record
                            ) === 1 && (
                              <span className="rounded-full bg-[#FDEAE3] px-2 py-1 text-[10px] font-medium text-[#D88072]">
                                NEW
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-[#999]">
                            {formatDateTime(
                              record.date
                            )}
                          </p>

                          {record.classTitle && (
                            <p className="mt-1 text-xs text-[#B8A99A]">
                              {
                                record.classTitle
                              }
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleCancelAttendance(
                              record
                            )
                          }
                          className="shrink-0 rounded-xl border border-[#E5B4AA] bg-white px-3 py-2 text-xs font-medium text-[#C86E61]"
                        >
                          출석 취소
                        </button>
                      </div>
                    </div>
                  )
                )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}