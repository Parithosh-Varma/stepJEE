"use client";

import { useCallback, useMemo, useRef, useState, type FormEvent, type ChangeEvent, type DragEvent } from "react";

type ProblemInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: string | null;
  image: string | null;
  onImageChange: (image: string | null) => void;
};

type InputMode = "type" | "upload" | "latex";

const MODE_TABS: { id: InputMode; label: string }[] = [
  { id: "type", label: "Type problem" },
  { id: "upload", label: "Upload image" },
  { id: "latex", label: "Paste LaTeX" },
];

const EXAMPLE_PROBLEMS = [
  "Find the derivative of f(x) = x^3 sin(x)",
  "A force of 10 N acts on a 2 kg mass. Find the acceleration.",
];

export function ProblemInput({ value, onChange, onSubmit, isLoading, error, image, onImageChange }: ProblemInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<InputMode>("type");
  const [dragOver, setDragOver] = useState(false);
  const showPreview = useMemo(() => mode === "latex" && value.trim().length > 0, [mode, value]);
  const latexPreview = useMemo(() => mode === "latex" && value.includes("\\") ? value : "", [mode, value]);

  const loadImageFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") onImageChange(result);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    if (mode === "upload") return;
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        event.preventDefault();
        const file = items[i].getAsFile();
        if (!file) return;
        loadImageFile(file);
        setMode("upload");
        return;
      }
    }
  }, [loadImageFile, mode]);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    loadImageFile(file);
    event.target.value = "";
  }, [loadImageFile]);

  const handleDragOver = useCallback((e: DragEvent) => {
    if (mode !== "upload") return;
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, [mode]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    if (mode !== "upload") return;
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      loadImageFile(file);
    }
  }, [mode, loadImageFile]);

  const handleExampleClick = useCallback((problem: string) => {
    onChange(problem);
    setMode("type");
    textareaRef.current?.focus();
  }, [onChange]);

  const submitDisabled = isLoading || (value.trim().length < 3 && !image);

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-[var(--ion-border)] bg-white shadow-[var(--ion-shadow)] dark:bg-stone-900">
      <div className="border-b border-[var(--ion-border-light)] px-4 py-3 sm:px-5 sm:py-3.5 dark:border-[var(--ion-border)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400">Problem</p>
      </div>

      {/* Input mode tabs */}
      <div className="flex gap-0.5 border-b border-[var(--ion-border-light)] bg-stone-50 px-3 py-2 dark:border-[var(--ion-border)] dark:bg-stone-800/50 sm:px-4">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
              mode === tab.id
                ? "bg-white text-stone-950 shadow-sm dark:bg-stone-700 dark:text-stone-100"
                : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {mode === "type" && (
          <textarea
            ref={textareaRef}
            id="problem"
            name="problem"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onPaste={handlePaste}
            placeholder="Type a JEE problem (e.g., &quot;Find the integral of x^2&quot;)"
            className="min-h-28 w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-950 outline-none transition-all placeholder:text-stone-400 focus:border-stone-400 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-500 dark:focus:bg-stone-800 sm:min-h-32"
            maxLength={2000}
            disabled={isLoading}
          />
        )}

        {mode === "upload" && (
          <div
            ref={dropRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
              dragOver
                ? "border-stone-950 bg-stone-100 dark:border-stone-100 dark:bg-stone-800"
                : "border-stone-300 bg-stone-50 hover:border-stone-400 dark:border-stone-600 dark:bg-stone-800/50 dark:hover:border-stone-500"
            }`}
          >
            {image ? (
              <div className="relative inline-block p-4">
                <img src={image} alt="Uploaded problem image" className="max-h-40 rounded-lg border border-stone-200 dark:border-stone-700" />
                <button
                  type="button"
                  onClick={() => onImageChange(null)}
                  className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 bg-white text-xs text-stone-500 shadow-sm transition-all hover:bg-stone-100 active:scale-90 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400"
                  title="Remove uploaded image"
                  aria-label="Remove uploaded image"
                >&times;</button>
              </div>
            ) : (
              <>
                <svg className="mb-2 h-8 w-8 text-stone-400 dark:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                  Drop an image here, or click to browse
                </p>
                <p className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
                  PNG, JPG, WEBP — handwritten or printed problems
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Upload problem image"
                />
              </>
            )}
          </div>
        )}

        {mode === "latex" && (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              id="problem-latex"
              name="problem"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Paste LaTeX here, e.g. \int x^2 dx"
              className="min-h-20 w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-sm leading-6 text-stone-950 outline-none transition-all placeholder:text-stone-400 focus:border-stone-400 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-500 dark:focus:bg-stone-800"
              maxLength={2000}
              disabled={isLoading}
            />
            {showPreview && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 font-math text-base leading-7 text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">Preview</p>
                {value}
              </div>
            )}
          </div>
        )}

        {/* Example suggestion links */}
        {mode === "type" && !value && (
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] text-stone-400 dark:text-stone-500">Try: </span>
            {EXAMPLE_PROBLEMS.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleExampleClick(ex)}
                className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] text-stone-500 transition-all hover:border-stone-400 hover:text-stone-700 active:scale-[0.97] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-500 dark:hover:text-stone-200"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {error && error.includes("image") && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
            Couldn&apos;t read the problem from the image. Try typing it directly or upload a clearer photo.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--ion-border-light)] px-4 py-3 dark:border-[var(--ion-border)] sm:px-5">
        <span className="text-[11px] text-stone-400 dark:text-stone-500">
          {mode === "latex" ? "LaTeX only" : mode === "upload" ? "Image + optional text" : "LaTeX + step-by-step"}
        </span>
        <button
          type="submit"
          disabled={submitDisabled}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-stone-950 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-stone-800 hover:shadow-sm active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-300"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>
              Generating
            </span>
          ) : "Generate steps"}
        </button>
      </div>

      {error && !error.includes("image") && (
        <div className="border-t border-[var(--ion-border-light)] px-4 py-3 dark:border-[var(--ion-border)] sm:px-5">
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">{error}</div>
        </div>
      )}
    </form>
  );
}
