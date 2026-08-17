"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteMember,
  getAttendance,
  getMembers,
  type AttendanceRecord,
  type Member,
} from "@/lib/googleSheet";

export default function AdminMembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<
    AttendanceRecord[]
  >([]);

  const [searchText, setSearchText] = useState("");
  const [selectedMemberKey, setSelectedMemberKey] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [deletingMemberKey, setDeletingMemberKey] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const isAuthenticated =
      sessionStorage.getItem("adminAuthenticated") === "true";

    if (!isAuthenticated) {
      router.replace("/admin");
      return;
    }

    loadMemberData();
  }, [router]);

  const loadMemberData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [memberData, attendanceData] =
        await Promise.all([
          getMembers(),
          getAttendance(),
        ]);

      setMembers(
        Array.isArray(memberData) ? memberData : []
      );

      setAttendance(
        Array.isArray(attendanceData)
          ? attendanceData
          : []
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "회원 정보를 불러오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (keyword === "") {
      return members;
    }

    return members.filter((member) => {
      const name =
        String(member.name || "").toLowerCase();

      const phone =
        String(member.fullPhone || member.phone || "");

      return (
        name.includes(keyword) ||
        phone.includes(keyword)
      );
    });
  }, [members, searchText]);

  const getMemberKey = (
    member: Member,
    index: number
  ) => {
    return (
      member.id ||
      `${member.name}-${member.phone}-${index}`
    );
  };

  const getMemberAttendance = (member: Member) => {
    return attendance
      .filter((record) => {
        const sameId =
          Boolean(member.id) &&
          Boolean(record.memberId) &&
          record.memberId === member.id;

        const sameNameAndPhone =
          record.name === member.name &&
          String(record.phone) ===
            String(member.phone);

        return sameId || sameNameAndPhone;
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  };

 const formatPhone = (member: Member) => {
  let fullPhone = String(member.fullPhone || "")
    .replace(/\D/g, "");

  if (fullPhone.length === 10 && fullPhone.startsWith("10")) {
    fullPhone = `0${fullPhone}`;
  }

  if (fullPhone.length === 11) {
    return `${fullPhone.slice(0, 3)}-${fullPhone.slice(
      3,
      7
    )}-${fullPhone.slice(7)}`;
  }

  return `010-****-${member.phone}`;
};

  const formatDate = (date?: string) => {
    if (!date) {
      return "정보 없음";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "정보 없음";
    }

    return parsedDate.toLocaleDateString("ko-KR");
  };

  const formatDateTime = (date?: string) => {
    if (!date) {
      return "시간 정보 없음";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "시간 정보 없음";
    }

    return parsedDate.toLocaleString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleDeleteMember = async (
    member: Member,
    memberKey: string
  ) => {
    const confirmed = window.confirm(
      `${member.name} 회원을 삭제할까요?\n회원 정보와 출석 기록이 모두 삭제됩니다.`
    );

    if (!confirmed || deletingMemberKey) {
      return;
    }

    setDeletingMemberKey(memberKey);

    try {
      const result = await deleteMember({
        id: member.id,
        name: member.name,
        phone: String(member.phone),
      });

      if (!result.deleted) {
        throw new Error(
          "구글시트에서 회원을 찾지 못했습니다."
        );
      }

      setMembers((currentMembers) =>
        currentMembers.filter((item) => {
          if (member.id && item.id) {
            return item.id !== member.id;
          }

          return !(
            item.name === member.name &&
            String(item.phone) ===
              String(member.phone)
          );
        })
      );

      setAttendance((currentAttendance) =>
        currentAttendance.filter((record) => {
          const sameId =
            Boolean(member.id) &&
            Boolean(record.memberId) &&
            record.memberId === member.id;

          const sameNameAndPhone =
            record.name === member.name &&
            String(record.phone) ===
              String(member.phone);

          return !(sameId || sameNameAndPhone);
        })
      );

      setSelectedMemberKey(null);

      alert(
        `회원이 삭제되었습니다.\n출석 기록 ${result.deletedAttendanceCount}건도 함께 삭제되었습니다.`
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "회원 삭제 중 오류가 발생했습니다."
      );
    } finally {
      setDeletingMemberKey(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-8 text-[#3F3F3F]">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#7FAF8A]">
              Blooming
            </p>

            <h1 className="mt-1 text-3xl font-light">
              회원관리
            </h1>
          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-xl border border-[#E8E1DA] bg-white px-4 py-2 text-sm"
          >
            관리자 홈
          </Link>
        </header>

        <section className="mt-7 grid grid-cols-2 gap-4">
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
              누적 출석
            </p>

            <p className="mt-2 text-3xl font-medium text-[#D8A48F]">
              {attendance.length}회
            </p>
          </div>
        </section>

        <section className="mt-5">
          <input
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            className="w-full rounded-2xl border border-[#E8E1DA] bg-white px-4 py-4 outline-none focus:border-[#7FAF8A]"
            placeholder="닉네임 또는 전화번호로 검색"
          />
        </section>

        {errorMessage && (
          <section className="mt-5 rounded-[24px] bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-[#D88072]">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadMemberData}
              className="mt-4 rounded-xl bg-[#7FAF8A] px-5 py-3 text-sm font-medium text-white"
            >
              다시 불러오기
            </button>
          </section>
        )}

        {isLoading ? (
          <section className="mt-5 rounded-[24px] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#7FAF8A]">
              회원 정보를 불러오는 중...
            </p>
          </section>
        ) : (
          !errorMessage && (
            <section className="mt-5 space-y-4">
              {filteredMembers.length === 0 ? (
                <div className="rounded-[24px] bg-white p-6 text-center shadow-sm">
                  <p className="text-sm text-[#999]">
                    등록된 회원을 찾을 수 없습니다.
                  </p>
                </div>
              ) : (
                filteredMembers.map(
                  (member, index) => {
                    const memberKey =
                      getMemberKey(member, index);

                    const isOpen =
                      selectedMemberKey === memberKey;

                    const memberAttendance =
                      getMemberAttendance(member);

                    const latestAttendance =
                      memberAttendance[0];

                    const isNewMember =
                      memberAttendance.length === 1;

                    return (
                      <article
                        key={memberKey}
                        className="rounded-[24px] bg-white p-5 shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedMemberKey(
                              isOpen
                                ? null
                                : memberKey
                            )
                          }
                          className="flex w-full items-center justify-between gap-4 text-left"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-lg font-medium">
                                {member.name}
                              </p>

                              {isNewMember && (
                                <span className="shrink-0 rounded-full bg-[#FDEAE3] px-2 py-1 text-[10px] font-medium text-[#D88072]">
                                  NEW
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-sm text-[#888]">
                              {formatPhone(member)}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-[#F1F8F3] px-3 py-1 text-[#5F8568]">
                                총 출석{" "}
                                {
                                  memberAttendance.length
                                }
                                회
                              </span>

                              <span className="rounded-full bg-[#FAF4EF] px-3 py-1 text-[#B27B67]">
                                최근 출석{" "}
                                {latestAttendance
                                  ? formatDate(
                                      latestAttendance.date
                                    )
                                  : "없음"}
                              </span>
                            </div>
                          </div>

                          <span className="shrink-0 text-2xl text-[#7FAF8A]">
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="mt-5 border-t border-[#EEE8E1] pt-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <p className="text-xs text-[#999]">
                                  요가 경험
                                </p>

                                <p className="mt-1 text-sm">
                                  {member.experience ||
                                    "정보 없음"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-[#999]">
                                  가입일
                                </p>

                                <p className="mt-1 text-sm">
                                  {formatDateTime(
                                    member.createdAt
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <p className="text-xs text-[#999]">
                                특이사항
                              </p>

                              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
                                {member.memo ||
                                  "특이사항 없음"}
                              </p>
                            </div>

                            <div className="mt-6">
                              <div className="flex items-center justify-between">
                                <h2 className="font-medium">
                                  출석 기록
                                </h2>

                                <span className="text-sm text-[#7FAF8A]">
                                  총{" "}
                                  {
                                    memberAttendance.length
                                  }
                                  회
                                </span>
                              </div>

                              {memberAttendance.length ===
                              0 ? (
                                <p className="mt-3 rounded-2xl bg-[#FAF9F6] px-4 py-4 text-sm text-[#999]">
                                  아직 출석 기록이
                                  없습니다.
                                </p>
                              ) : (
                                <div className="mt-3 space-y-3">
                                  {memberAttendance.map(
                                    (
                                      record,
                                      recordIndex
                                    ) => (
                                      <div
                                        key={`${record.date}-${recordIndex}`}
                                        className="rounded-2xl bg-[#FAF9F6] px-4 py-3"
                                      >
                                        <p className="font-medium">
                                          {record.classTitle ||
                                            "수업 정보 없음"}
                                        </p>

                                        <p className="mt-1 text-xs text-[#999]">
                                          {formatDateTime(
                                            record.date
                                          )}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteMember(
                                  member,
                                  memberKey
                                )
                              }
                              disabled={
                                deletingMemberKey ===
                                memberKey
                              }
                              className="mt-6 w-full rounded-2xl border border-[#E5B4AA] bg-white py-3 text-sm font-medium text-[#C86E61] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingMemberKey ===
                              memberKey
                                ? "회원 삭제 중..."
                                : "회원 삭제"}
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  }
                )
              )}
            </section>
          )
        )}
      </div>
    </main>
  );
}