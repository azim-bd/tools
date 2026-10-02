import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Azim Tools — Image to Table",
  description: "Convert table images into editable data and export to CSV or Excel.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
