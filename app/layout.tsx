import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiMStudios Process Assistant",
  description: "Ask questions about LiMStudios's documented processes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
