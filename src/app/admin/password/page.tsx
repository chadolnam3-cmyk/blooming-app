"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const isAuthenticated =
      sessionStorage.getItem("adminAuthenticated") === "true";

    if (!isAuthenticated) {
      router.replace("/admin");
    }
  }, [router]);

  const canChange =
    currentPassword.trim() !== "" &&
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "";

  const handleChangePassword = () => {
    if (!canChange) return;

    const savedPassword =
      localStorage.getItem("adminPassword") || "1234";

    if (currentPassword !== savedPassword) {
      setIsError(true);
      setMessage("현재 비밀번호가 올바르지 않습니다.");
      return;
    }

    if (newPassword.length < 4) {
      setIsError(true);
      setMessage("새 비밀번호는 4자리 이상으로 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    if (newPassword === currentPassword) {
      setIsError(true);
      setMessage("현재 비밀번호와 다른 비밀번호를 입력해주세요.");
      return;
    }

    localStorage.setItem("adminPassword", newPassword);

    setIsError(false);
    setMessage("비밀번호가 변경되었습니다 🔐");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    window.setTimeout(() => {
      sessionStorage.removeItem("adminAuthenticated");
      router.replace("/admin");
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-5 py-8 text-[#3F3F3F]">
      <div className="mx-auto max-w-md">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#7FAF8A]">Blooming</p>

            <h1 className="mt-1 text-3xl font-light">
              비밀번호 변경
            </h1>
          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-xl border border-[#E8E1DA] bg-white px-4 py-2 text-sm"
          >
            관리자 홈
          </Link>
        </header>

        <section className="mt-7 rounded-[28px] bg-white p-6 shadow-sm">
          <p className="text-sm leading-relaxed text-[#888]">
            비밀번호를 변경하면 관리자 로그인 화면으로 이동합니다.
          </p>

          <div className="mt-6">
            <label className="text-sm text-[#666]">
              현재 비밀번호
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setMessage("");
              }}
              className="mt-2 w-full rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
              placeholder="현재 비밀번호 입력"
            />
          </div>

          <div className="mt-5">
            <label className="text-sm text-[#666]">
              새 비밀번호
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setMessage("");
              }}
              className="mt-2 w-full rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
              placeholder="4자리 이상 입력"
            />
          </div>

          <div className="mt-5">
            <label className="text-sm text-[#666]">
              새 비밀번호 확인
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setMessage("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleChangePassword();
                }
              }}
              className="mt-2 w-full rounded-2xl border border-[#E8E1DA] bg-[#FAF9F6] px-4 py-4 outline-none focus:border-[#7FAF8A]"
              placeholder="새 비밀번호 다시 입력"
            />
          </div>

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={!canChange}
            className={`mt-7 w-full rounded-2xl py-4 font-medium transition ${
              canChange
                ? "bg-[#7FAF8A] text-white active:scale-[0.98]"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            비밀번호 변경하기
          </button>

          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                isError ? "text-[#D88072]" : "text-[#7FAF8A]"
              }`}
            >
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}