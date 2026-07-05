"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FunctionGraph } from "@/components/function-graph";

type MathTextProps = {
  text: string;
};

let katexLoaded = false;
let loadingPromise: Promise<any> | null = null;

function loadKatex(): Promise<any> {
  if ((window as any).katex) {
    katexLoaded = true;
    return Promise.resolve((window as any).katex);
  }
  if (loadingPromise) return loadingPromise;
  if (!document.querySelector('link[href*="katex"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/katex.min.css";
    document.head.appendChild(link);
  }
  loadingPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "/js/katex.min.js";
    script.onload = () => {
      katexLoaded = true;
      resolve((window as any).katex);
    };
    document.head.appendChild(script);
  });
  return loadingPromise;
}

const MATH_RE = /(\$\$.+?\$\$|\$.+?\$)/g;
const GRAPH_RE = /\\graph\{([^}]+)\}/g;

type Part =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string }
  | { type: "graph"; expressions: string };

function parse(text: string): Part[] {
  const parts: Part[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  const graphMatches: { index: number; length: number; expressions: string }[] = [];
  const graphRe = new RegExp(GRAPH_RE.source, "g");
  while ((match = graphRe.exec(text)) !== null) {
    graphMatches.push({ index: match.index, length: match[0].length, expressions: match[1] });
  }

  type SplitPoint = { pos: number; type: "math" | "graph" };
  const mathRe = new RegExp(MATH_RE.source, "g");
  const splitPoints: SplitPoint[] = [];

  while ((match = mathRe.exec(text)) !== null) {
    splitPoints.push({ pos: match.index, type: "math" });
  }
  for (const gm of graphMatches) {
    splitPoints.push({ pos: gm.index, type: "graph" });
  }

  splitPoints.sort((a, b) => a.pos - b.pos);

  let cursor = 0;
  for (const sp of splitPoints) {
    if (sp.pos > cursor) {
      parts.push({ type: "text", value: text.slice(cursor, sp.pos) });
    }
    if (sp.type === "math") {
      const raw = text.slice(sp.pos);
      const m = raw.match(MATH_RE);
      if (m) {
        if (m[0].startsWith("$$")) {
          parts.push({ type: "block", value: m[0].slice(2, -2) });
        } else {
          parts.push({ type: "inline", value: m[0].slice(1, -1) });
        }
        cursor = sp.pos + m[0].length;
      }
    } else {
      const gm = graphMatches.find((g) => g.index === sp.pos);
      if (gm) {
        parts.push({ type: "graph", expressions: gm.expressions });
        cursor = sp.pos + gm.length;
      }
    }
  }

  if (cursor < text.length) {
    parts.push({ type: "text", value: text.slice(cursor) });
  }

  return parts;
}

export function MathText({ text }: MathTextProps) {
  const [katex, setKatex] = useState<any>(katexLoaded ? (window as any).katex : null);
  const parts = useMemo(() => parse(text), [text]);

  useEffect(() => {
    if (katexLoaded && (window as any).katex) {
      return;
    }
    loadKatex().then(setKatex);
  }, []);

  const rendered = useMemo(() => {
    return parts.map((part, i) => {
      if (part.type === "text") {
        return <span key={i}>{part.value}</span>;
      }

      if (part.type === "graph") {
        const fns = part.expressions.split(",").map((s) => s.trim()).filter(Boolean);
        return (
          <FunctionGraph
            key={i}
            expressions={fns.map((fn) => ({
              fn,
              color: `hsl(${(fns.indexOf(fn) * 60) % 360}, 0%, 20%)`,
            }))}
          />
        );
      }

      const isBlock = part.type === "block";
      if (katex) {
        try {
          const html = katex.renderToString(part.value, {
            displayMode: isBlock,
            throwOnError: false,
            strict: false,
          });
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch {}
      }

      if (isBlock) {
        return (
          <div key={i} className="my-3 overflow-x-auto text-base leading-8 text-stone-800 font-mono bg-stone-100 rounded-lg p-3">
            {part.value}
          </div>
        );
      }
      return (
        <code key={i} className="font-mono text-stone-800 bg-stone-100 px-1 rounded">
          {part.value}
        </code>
      );
    });
  }, [parts, katex]);

  return <>{rendered}</>;
}
