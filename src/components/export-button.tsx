"use client";

import type { SolutionRecord } from "@/types/solution";

type ExportButtonProps = {
  solution: SolutionRecord;
};

export function ExportButton({ solution }: ExportButtonProps) {
  function handleExport() {
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
    const shareData = {
      title: solution.title,
      text: `${solution.title}\n\n${solution.steps.map((s) => `${s.order}. ${s.detail}`).join("\n")}`,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareData.text).then(() => {
        alert("Solution copied to clipboard");
      }).catch(() => {});
    }
  }

  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={handleExport}
        className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] font-medium text-stone-600 transition-all hover:border-stone-950 hover:text-stone-950"
      >
        Export
      </button>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          type="button"
          onClick={handleShare}
          className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] font-medium text-stone-600 transition-all hover:border-stone-950 hover:text-stone-950"
        >
          Share
        </button>
      )}
    </div>
  );
}
