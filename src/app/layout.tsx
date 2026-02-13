// src/app/layout.tsx
import "./globals.css";
import "@/styles/theme.css";
import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import SecondaryNavBar from "@/components/SecondaryNavBar";
import HydratedError from "@/components/HydratedError";
import AnalyticsHeartbeat from "@/components/AnalyticsHeartbeat";

export const metadata: Metadata = {
  title: "The XPosiGuide",
  description: "An educational X-ray positioning guide.",
  icons: { icon: "/finalxposi.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="relative min-h-screen flex flex-col text-neutral-900"
      >
        {/* 🌫 GLOBAL BACKGROUND IMAGE */}
        <div className="fixed inset-0 -z-20">
          <img
            src="/bg.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 🤍 SOFT WHITE OVERLAY FOR READABILITY */}
        <div className="fixed inset-0 -z-10 bg-white/80 backdrop-blur-[2px]" />

        {/* ❤️ REALTIME USER HEARTBEAT */}
        <AnalyticsHeartbeat />

        {/* HEADER */}
        <HydratedError>
          <Header />
        </HydratedError>

        {/* SECONDARY NAVBAR */}
        <HydratedError>
          <SecondaryNavBar />
        </HydratedError>

        {/* MAIN CONTENT */}
        <main className="flex-grow w-full relative z-10">
          {children}
        </main>

        {/* FOOTER */}
        <HydratedError>
          <Footer />
        </HydratedError>

        {/* ✅ SMART SCROLL RESTORATION */}
        <Script id="scroll-restore-handler" strategy="afterInteractive">
          {`
            if ('scrollRestoration' in history) {
              const path = window.location.pathname;
              if (path.startsWith('/pdf-ai')) {
                history.scrollRestoration = 'auto';
              } else {
                history.scrollRestoration = 'manual';
              }
            }
          `}
        </Script>

        {/* 📩 MAILERLITE SCRIPT */}
        <Script id="mailerlite-universal" strategy="afterInteractive">
          {`
            (function(w,d,e,u,f,l,n){
              w[f]=w[f]||function(){(w[f].q=w[f].q||[]).push(arguments);};
              l=d.createElement(e),l.async=1,l.src=u;
              n=d.getElementsByTagName(e)[0];n.parentNode.insertBefore(l,n);
            })(window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
            ml('account','1888147');
          `}
        </Script>
      </body>
    </html>
  );
}
