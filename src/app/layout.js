import { Manrope } from "next/font/google";
import DynamicHeroProvider from "@/components/providers/DynamicHeroProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "ReportARG - Participación Ciudadana",
  description: "Plataforma de conexión entre ciudadanos e instituciones",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={manrope.variable} suppressHydrationWarning>
      <body
        className={`${manrope.className} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <DynamicHeroProvider>
              {children}
              <Toaster position="top-right" richColors />
            </DynamicHeroProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}