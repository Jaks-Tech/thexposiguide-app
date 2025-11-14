// src/app/layout.tsx
import "./globals.css";
import "@/styles/theme.css";
import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import HomeLayout from "@/components/HomeLayout";

export const metadata: Metadata = {
  title: "The XPosiGuide",
  description: "An educational X-ray positioning guide.",
  icons: { icon: "/finalxposi.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-neutral-900 flex flex-col">

        {/* HEADER */}
          {/* HEADER BLOCK (we measure this with CSS only) */}
          <div id="header-block">
            <Header />

            <div className="overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white py-2 shadow-md">
              <div className="whitespace-nowrap animate-marquee font-medium text-sm sm:text-base tracking-wide">
                ⚡ Welcome to The XPosiGuide — Learn, Revise & Practice!
              </div>
            </div>
          </div>


        {/* MAIN WRAPPER */}
        <HomeLayout>
          <main className="flex-grow w-full">
            {children}
          </main>
        </HomeLayout>

        {/* FOOTER */}
        <Footer />

        {/* SCRIPTS */}
        <Script id="mailerlite-universal" strategy="afterInteractive">
          {`
            (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[]).push(arguments);};
            l=d.createElement(e),l.async=1,l.src=u;
            n=d.getElementsByTagName(e)[0];n.parentNode.insertBefore(l,n);})
            (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
            ml('account','1888147');
          `}
        </Script>

      </body>
    </html>
  );
}
