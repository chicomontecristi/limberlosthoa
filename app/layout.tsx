import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Limberlost HOA",
  description: "Owner portal for the Limberlost HOA community.",
  metadataBase: new URL("https://limberlosthoa.org"),
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
