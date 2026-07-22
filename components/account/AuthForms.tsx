"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserPlus, LogIn } from "lucide-react";

export function AuthForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/my-account/orders";

  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "reset") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Не удалось отправить письмо");
        }
        setSuccess(
          "Если аккаунт с таким email существует, мы отправили на него новый пароль."
        );
        return;
      }

      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body: Record<string, string> = { email, password };
      if (mode === "register") body.name = name;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка авторизации");
      }

      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 rounded-2xl border border-lime-200 bg-gradient-to-br from-lime-50 to-fuchsia-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-fuchsia-200 bg-white text-fuchsia-500">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Аккаунт создаётся автоматически
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
              Вам не нужно регистрироваться заранее. Личный кабинет будет создан
              автоматически сразу после покупки приглашения. Просто укажите свой
              Email при оформлении заказа, и мы пришлём данные для входа.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Выбрать приглашение →
            </Link>
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-zinc-900">
        {mode === "login"
          ? "Вход"
          : mode === "register"
          ? "Регистрация"
          : "Восстановление пароля"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-900"
            >
              Имя
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
            />
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-900"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
          />
        </div>
        {mode !== "reset" && (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-900"
            >
              Пароль <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
            />
          </div>
        )}

        {mode === "reset" && (
          <p className="text-sm leading-relaxed text-zinc-500">
            Укажите email, с которым вы оформляли заказ. Мы отправим на него
            новый пароль.
          </p>
        )}

        {mode === "login" && (
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 accent-fuchsia-500"
            />
            <label htmlFor="remember" className="text-sm text-zinc-700">
              Запомнить меня
            </label>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-lime-50 p-3 text-sm text-lime-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-lime-200 px-6 py-2.5 text-sm font-semibold text-lime-900 transition hover:bg-lime-300 disabled:opacity-60"
        >
          <LogIn size={18} />
          {loading
            ? "Подождите…"
            : mode === "login"
            ? "Войти"
            : mode === "register"
            ? "Зарегистрироваться"
            : "Отправить новый пароль"}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600">
        {mode === "reset" ? (
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
            }}
            className="text-fuchsia-600 underline underline-offset-2 hover:text-fuchsia-700"
          >
            ← Вернуться ко входу
          </button>
        ) : (
          <>
            {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
                setSuccess(null);
              }}
              className="text-fuchsia-600 underline underline-offset-2 hover:text-fuchsia-700"
            >
              {mode === "login" ? "Зарегистрироваться" : "Войти"}
            </button>
          </>
        )}
      </p>

      {mode === "login" && (
        <p className="mt-2 text-sm text-zinc-500">
          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setError(null);
              setSuccess(null);
            }}
            className="hover:text-zinc-700"
          >
            Забыли свой пароль?
          </button>
        </p>
      )}
    </div>
  );
}
