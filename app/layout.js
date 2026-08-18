import "./globals.css";

import { getSiteSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = getSiteSettings();
  return {
    title: settings.siteTitle,
    description: settings.siteDescription,
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
