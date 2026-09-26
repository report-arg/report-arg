import { Manrope } from "next/font/google";
import DynamicHeroProvider from "@/components/providers/DynamicHeroProvider";
import AuthProvider from "@/components/providers/AuthProvider";
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={manrope.variable}>
      <body
        className={`${manrope.className} font-sans antialiased`}
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