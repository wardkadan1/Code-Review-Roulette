import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Code Review Roulette",
  description:
    "Spin. Match. Review. Ship better code. Fair reviewer assignments for your team.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
