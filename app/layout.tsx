import type { Metadata } from "next";
import "./globals.css";
import { AOSInit } from "@/components/aos-init";

export const metadata: Metadata = {
  title: "CibiOne CMS",
  description: "CMS SMKN 1 Cibinong untuk JHIC 2026",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
        />
      </head>
      <body>
        <AOSInit />
        {children}
      </body>
    </html>
  );
}
