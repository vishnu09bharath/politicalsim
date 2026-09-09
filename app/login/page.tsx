"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.replace("/");
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900">
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Password Required
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            placeholder="Enter password"
            autoComplete="current-password"
            className="h-12 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500"
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-lg bg-zinc-900 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
