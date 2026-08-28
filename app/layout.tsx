import type { Metadata } from "next";
import "./globals.css";
import AuthNav from "./components/AuthNav";

export const metadata: Metadata = {
  title: "UMAIR HUB",
  description: "Personal AI study and productivity hub for students.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AuthNav />{children}</body>
    </html>
  );
}
