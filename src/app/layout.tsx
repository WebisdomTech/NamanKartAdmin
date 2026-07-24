import type { Metadata } from "next";
import "@/src/styles.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "NamanKart Enterprise Console",
  description: "NamanKart MongoDB Admin Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
