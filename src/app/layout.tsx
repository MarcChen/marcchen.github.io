import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import Script from "next/script";
import CursorGlow from "@/components/layout/CursorGlow";
import { assetPath } from "@/lib/paths";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marc Chen — Data Engineer & AI/ML Engineer",
  description:
    "Portfolio and personal blog of Marc Chen. Data Engineer, AI & ML Engineer, with expertise in Google Cloud, Python, and modern data stack.",
  icons: {
    icon: assetPath("/images/site/favicon.png"),
  },
  openGraph: {
    title: "Marc Chen — Data Engineer & AI/ML Engineer",
    description:
      "Portfolio and personal blog of Marc Chen. Data Engineer, AI & ML Engineer.",
    url: "https://marcchen.github.io",
    siteName: "Marc Chen",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
    >
      <head />
      <body style={{ fontFamily: "var(--font-sans)" }}>
        {/* Theme script must run before render to prevent flash */}
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <CursorGlow />
        {children}

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W2DZCT2HCH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W2DZCT2HCH');
          `}
        </Script>

        {/* StatCounter */}
        <Script id="statcounter" strategy="afterInteractive">
          {`
            var sc_project=13085075;
            var sc_invisible=1;
            var sc_security="0795b862";
          `}
        </Script>
        <Script
          src="https://www.statcounter.com/counter/counter.js"
          strategy="afterInteractive"
        />

        {/* Umami Analytics */}
        <Script
          src="https://umami-silk-psi.vercel.app/script.js"
          data-website-id="370aee40-7d98-4f01-b66c-28a8b8298bdf"
          strategy="afterInteractive"
        />

        <Script id="sw-cleanup" strategy="beforeInteractive">
          {`if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations()
              .then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); })
              .catch(function () {});
          }`}
        </Script>

        {/* Cal.com Floating Button */}
        <Script id="cal-embed" strategy="afterInteractive">
          {`
            (function (C, A, L) {
              let p = function (a, ar) { a.q.push(ar); };
              let d = C.document;
              C.Cal = C.Cal || function () {
                let cal = C.Cal;
                let ar = arguments;
                if (!cal.loaded) {
                  cal.ns = {};
                  cal.q = cal.q || [];
                  d.head.appendChild(d.createElement("script")).src = A;
                  cal.loaded = true;
                }
                if (ar[0] === L) {
                  const api = function () { p(api, arguments); };
                  const namespace = ar[1];
                  api.q = api.q || [];
                  if (typeof namespace === "string") {
                    cal.ns[namespace] = cal.ns[namespace] || api;
                    p(cal.ns[namespace], ar);
                    p(cal, ["initNamespace", namespace]);
                  } else p(cal, ar);
                  return;
                }
                p(cal, ar);
              };
            })(window, "https://app.cal.com/embed/embed.js", "init");
            Cal("init", "30min", { origin: "https://app.cal.com" });
            Cal.ns["30min"]("floatingButton", {
              calLink: "marc-chen/30min",
              config: { layout: "month_view" },
              buttonText: "Book a call",
            });
            Cal.ns["30min"]("ui", {
              hideEventTypeDetails: false,
              layout: "month_view",
            });
          `}
        </Script>
      </body>
    </html>
  );
}
