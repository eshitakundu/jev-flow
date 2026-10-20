import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "./globals.css";
import "./halftone.css";

export const metadata: Metadata = {
  title: "Jev Flow — Test inbox",
  description:
    "Test Jev support triage, tune confidence, and inspect every decision.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
