import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "stepJEE — Step-by-Step JEE Problem Solver",
  description: "Generate step-by-step solutions for JEE Mathematics, Physics, and Chemistry problems. AI-powered, syllabus-driven, with LaTeX rendering.",
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
  openGraph: {
    title: "stepJEE — Step-by-Step JEE Problem Solver",
    description: "AI-powered step-by-step solutions for JEE Mathematics, Physics, and Chemistry problems with LaTeX rendering, hints, and verification.",
    type: "website",
    siteName: "stepJEE",
  },
  twitter: {
    card: "summary",
    title: "stepJEE — Step-by-Step JEE Problem Solver",
    description: "Generate step-by-step solutions for JEE problems with LaTeX rendering and verification.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              if (localStorage.getItem('stepjee-theme') === 'dark') {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-stone-50 text-stone-950 antialiased selection:bg-stone-950 selection:text-white dark:bg-stone-950 dark:text-stone-100 dark:selection:bg-stone-100 dark:selection:text-stone-950">
        {children}
      </body>
    </html>
  );
}
