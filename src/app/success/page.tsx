"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Success() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
      <div className="text-center">
        <div className="text-5xl">🌸</div>
        <h1 className="mt-4 text-xl text-[#7FAF8A]">
          출석 완료
        </h1>
      </div>
    </main>
  );
}