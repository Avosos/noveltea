import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovelTea",
  description: "Structured authoring environment for novels and narrative worlds — part of the Avosos ecosystem",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
