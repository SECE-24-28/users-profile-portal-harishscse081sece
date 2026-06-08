// app/layout.tsx
// Root layout — wraps every page with HTML structure and global styles.

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Profile Portal",
  description: "Manage student profiles",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
