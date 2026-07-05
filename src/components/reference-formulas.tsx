"use client";

import { useEffect, useState } from "react";
import { MathText } from "./math-text";

type ReferenceFormulasProps = {
  subject: string;
  topic: string;
};

export function ReferenceFormulas({ subject, topic }: ReferenceFormulasProps) {
  const [formulas, setFormulas] = useState<Array<{ formulaKey: string; formulaLatex: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subject || !topic) return;
    let cancelled = false;
    fetch(`/api/formulas?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`)
      .then((r) => r.json())
      .then(({ data }) => { if (!cancelled) setFormulas(data ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [subject, topic]);

  if (!subject || !topic) return null;
  if (loading) return null;
  if (formulas.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--ion-border)] bg-white p-5 shadow-[var(--ion-shadow)] dark:bg-stone-900">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400 mb-3">Reference Formulas</p>
      <div className="space-y-3">
        {formulas.map((f) => (
          <div key={f.formulaKey}>
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-0.5">{f.formulaKey}</p>
            <div className="text-sm text-stone-900 dark:text-stone-200"><MathText text={`$$${f.formulaLatex}$$`} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
