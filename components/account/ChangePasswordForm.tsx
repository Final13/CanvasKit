"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== repeatPassword) {
      setError("Новые пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Не удалось изменить пароль");
        return;
      }
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setRepeatPassword("");
    } catch {
      setError("Не удалось изменить пароль");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-fuchsia-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-zinc-900">Смена пароля</h2>
      <div className="mt-4 space-y-3">
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Текущий пароль"
          required
          className={inputClass}
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Новый пароль"
          required
          minLength={6}
          className={inputClass}
        />
        <input
          type="password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          placeholder="Повторите новый пароль"
          required
          minLength={6}
          className={inputClass}
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {success && (
        <p className="mt-3 text-sm text-lime-600">Пароль успешно изменён.</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 cursor-pointer rounded-xl bg-fuchsia-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500 disabled:opacity-50"
      >
        {loading ? "Сохранение…" : "Изменить пароль"}
      </button>
    </form>
  );
}
