import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AcxiomCRM — Sales Workspace",
  description: "Customer relationship and sales pipeline management",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
