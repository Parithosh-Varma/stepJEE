import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "stepJEE",
  description: "Step-by-step solutions for JEE Mathematics, Physics, and Chemistry problems.",
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
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
