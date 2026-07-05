"use client";

import { useCallback, useRef, type FormEvent, type ChangeEvent } from "react";

type ProblemInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: string | null;
  image: string | null;
  onImageChange: (image: string | null) => void;
};

export function ProblemInput({ value, onChange, onSubmit, isLoading, error, image, onImageChange }: ProblemInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadImageFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") onImageChange(result);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        event.preventDefault();
        const file = items[i].getAsFile();
        if (!file) return;
        loadImageFile(file);
        return;
      }
    }
  }, [loadImageFile]);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    loadImageFile(file);
    event.target.value = "";
  }, [loadImageFile]);

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-[var(--ion-border)] bg-white shadow-[var(--ion-shadow)] dark:bg-stone-900">
      <div className="border-b border-[var(--ion-border-light)] px-4 py-3 sm:px-5 sm:py-3.5 dark:border-[var(--ion-border)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400">Problem</p>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <textarea
          ref={textareaRef}
          id="problem"
          name="problem"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onPaste={handlePaste}
          placeholder="Type a JEE problem or paste an image (Cmd+V)"
          className="min-h-28 w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-950 outline-none transition-all placeholder:text-stone-400 focus:border-stone-400 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-500 dark:focus:bg-stone-800 sm:min-h-32"
          maxLength={2000}
          disabled={isLoading}
        />

        <p className="text-[11px] text-stone-400 dark:text-stone-500">
          Accepts: typed text, LaTeX (<code className="text-stone-500 dark:text-stone-400">$$...$$</code>), image paste/upload
        </p>

        {image ? (
          <div className="relative inline-block">
            <img src={image} alt="Uploaded problem image" className="max-h-32 rounded-lg border border-stone-200 dark:border-stone-700" />
            <button
              type="button"
              onClick={() => onImageChange(null)}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 bg-white text-xs text-stone-500 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400"
              title="Remove uploaded image"
              aria-label="Remove uploaded image"
            >&times;</button>
          </div>
        ) : (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-500 transition-all hover:border-stone-400 hover:text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-500 dark:hover:text-stone-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            Upload image
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--ion-border-light)] px-4 py-3 dark:border-[var(--ion-border)] sm:px-5">
        <span className="text-[11px] text-stone-400 dark:text-stone-500">LaTeX + step-by-step</span>
        <button
          type="submit"
          disabled={isLoading || (value.trim().length < 3 && !image)}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-stone-950 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-stone-800 disabled:opacity-40 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-300"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>
              Generating
            </span>
          ) : "Generate steps"}
        </button>
      </div>

      {error && (
        <div className="border-t border-[var(--ion-border-light)] px-4 py-3 dark:border-[var(--ion-border)] sm:px-5">
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">{error}</div>
        </div>
      )}
    </form>
  );
}
