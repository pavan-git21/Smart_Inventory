import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Inventory Tracker",
  description: "Manage your stock and sales",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
