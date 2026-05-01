import { Geist, Geist_Mono } from "next/font/google";
import DynamicHeroProvider from "@/components/providers/DynamicHeroProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "ReportARG",
  description: "Plataforma ciudadana ReportARG",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <DynamicHeroProvider>
            {children}
            <Toaster position="top-right" richColors />
          </DynamicHeroProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
