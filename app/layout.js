import "./globals.css";

import { getSiteSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const baseUrl = settings.portfolioUrl || "https://aivideocreator.cv/";

  return {
    metadataBase: new URL(baseUrl),
    title: settings.siteTitle,
    description: settings.siteDescription,
    alternates: {
      canonical: "/",
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
