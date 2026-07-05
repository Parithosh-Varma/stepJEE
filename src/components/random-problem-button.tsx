"use client";

import { PHYSICS_TOPICS, MATHS_TOPICS, CHEMISTRY_TOPICS, topicSlug } from "@/lib/topics";

type RandomProblemButtonProps = {
  onPick: (subject: string, topic: string, slug: string) => void;
};

const ALL_TOPICS = [
  ...PHYSICS_TOPICS.map((t) => ({ subject: "Physics", topic: t })),
  ...MATHS_TOPICS.map((t) => ({ subject: "Mathematics", topic: t })),
  ...CHEMISTRY_TOPICS.map((t) => ({ subject: "Chemistry", topic: t })),
];

export function RandomProblemButton({ onPick }: RandomProblemButtonProps) {
  function handleClick() {
    const item = ALL_TOPICS[Math.floor(Math.random() * ALL_TOPICS.length)];
    onPick(item.subject, item.topic, topicSlug(item.topic));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-500 transition-all hover:border-stone-400 hover:text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-500 dark:hover:text-stone-200"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
      </svg>
      Random
    </button>
  );
}
