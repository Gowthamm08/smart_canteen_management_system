import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Canteen | Campus Dining",
  description: "A better campus dining experience, made simple.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
