"use client";

import { useState } from "react";

function getInitialDark(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem("stepjee-theme") === "dark"; } catch { return false; }
}

export function DarkModeToggle() {
  const [dark, setDark] = useState(getInitialDark);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("stepjee-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("stepjee-theme", "light");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-stone-500 transition-all hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? "\u2600" : "\u263E"}
    </button>
  );
}
