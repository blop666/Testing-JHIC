import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AOSInit } from "@/components/aos-init";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SMKN 1 Cibinong",
  description: "Website resmi SMKN 1 Cibinong",
  icons: {
    icon: "/cropped-logo-SMKN-1-Cbn.png",
    shortcut: "/cropped-logo-SMKN-1-Cbn.png",
    apple: "/cropped-logo-SMKN-1-Cbn.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={poppins.variable}>
      <body>
        <AOSInit />
        {children}
      </body>
    </html>
  );
}
