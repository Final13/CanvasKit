"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className}
    >
      Выйти
    </button>
  );
}
