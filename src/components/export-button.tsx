"use client";

import type { SolutionRecord } from "@/types/solution";

type ExportButtonProps = {
  solution: SolutionRecord;
};

export function ExportButton({ solution }: ExportButtonProps) {
  function getSolutionUrl() {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.set("solution", String(solution.id));
    return url.toString();
  }

  function handleExportHtml() {
    const content = `
      <html>
        <head><meta charset="utf-8"><title>${solution.title}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; color: #1c1917; line-height: 1.6; }
          h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
          .meta { font-size: 0.875rem; color: #78716c; margin-bottom: 1.5rem; }
          ol { padding-left: 1.5rem; }
          li { margin-bottom: 0.75rem; }
        </style>
        </head>
        <body>
          <h1>${solution.title}</h1>
          <p class="meta">${solution.steps.length} steps</p>
          <ol>
            ${solution.steps.map((s) => `<li><strong>${s.heading || `Step ${s.order}`}</strong><br>${s.detail}</li>`).join("")}
          </ol>
        </body>
      </html>
    `;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${solution.title.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleShare() {
    const url = getSolutionUrl();
    if (navigator.share) {
      navigator.share({ title: solution.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert("Link copied to clipboard");
      }).catch(() => {});
    }
  }

  function handleCopyLink() {
    const url = getSolutionUrl();
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard");
    }).catch(() => {});
  }

  return (
    <div className="flex flex-wrap gap-1">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex min-h-[44px] items-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition-all hover:border-stone-950 hover:text-stone-950 active:scale-[0.97] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-100 dark:hover:text-stone-100"
        title="Share a link to this solution"
        aria-label="Share solution link"
      >
        Share link
      </button>
      <button
        type="button"
        onClick={handleExportHtml}
        className="inline-flex min-h-[44px] items-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition-all hover:border-stone-950 hover:text-stone-950 active:scale-[0.97] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-100 dark:hover:text-stone-100"
        title="Download solution as HTML"
        aria-label="Export solution as HTML file"
      >
        Export HTML
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex min-h-[44px] items-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition-all hover:border-stone-950 hover:text-stone-950 active:scale-[0.97] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-100 dark:hover:text-stone-100"
        title="Copy solution link to clipboard"
        aria-label="Copy solution link"
      >
        Copy link
      </button>
    </div>
  );
}
