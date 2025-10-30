// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "@/styles/theme.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script"; // ✅ import for MailerLite scripts

export const metadata: Metadata = {
  title: "The XPosiGuide",
  description:
    "An educational X-ray positioning guide for radiography students and professionals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ MailerLite Universal Script */}
        <Script id="mailerlite-universal" strategy="beforeInteractive">
          {`
            (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[]).push(arguments);};
            l=d.createElement(e),l.async=1,l.src=u;
            n=d.getElementsByTagName(e)[0];n.parentNode.insertBefore(l,n);})
            (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
            ml('account', '1888147');
          `}
        </Script>
      </head>

      <body
        suppressHydrationWarning
        className="min-h-screen bg-white text-neutral-900 flex flex-col"
      >
        <Header />
        <main className="flex-grow w-full">{children}</main>
        <Footer />

        {/* ✅ MailerLite success message handler */}
        <Script id="mailerlite-success" strategy="afterInteractive">
          {`
            document.addEventListener("ml_webform_success", function() {
              const msg = document.getElementById("successMessage");
              if (msg) {
                msg.classList.remove("hidden");
                msg.classList.add("animate-fadeInUp");
                setTimeout(() => {
                  msg.classList.add("hidden");
                }, 5000);
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
