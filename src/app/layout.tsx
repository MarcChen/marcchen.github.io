import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import Script from "next/script";
import MotionProvider from "@/components/layout/MotionProvider";
import { assetPath } from "@/lib/paths";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-archivo",
  axes: ["wdth"],
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
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${jetbrains.variable}`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        {/* Synchronous inline FOUC prevention immediately after meta[name="color-scheme"] */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("color-scheme");if(!s){var l=localStorage.getItem("theme-scheme");if(l==="light"||l==="dark"){s=l;localStorage.setItem("color-scheme",s);}}if(s==="light"||s==="dark"){var m=document.querySelector('meta[name="color-scheme"]');if(m)m.content=s;}if(localStorage.getItem("palette")==="espresso")document.documentElement.dataset.palette="espresso";}catch(e){}var bp=${JSON.stringify(basePath)};var p=location.pathname;if(bp&&p.indexOf(bp)===0)p=p.slice(bp.length)||"/";if(/^\\/fr(\\/|$)/.test(p))document.documentElement.lang="fr";else if(/^\\/zh-cn(\\/|$)/.test(p))document.documentElement.lang="zh-CN";})();`,
          }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-sans)" }}>
        <MotionProvider>
          {children}
        </MotionProvider>

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
      </body>
    </html>
  );
}
