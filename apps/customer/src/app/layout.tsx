import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Toaster } from "@/components/ui/toaster";
import { GlobalBookingWrapper } from "@/components/layout/global-booking-wrapper";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anex Salon",
  description: "India's most premium salon customer experience",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Anex Salon",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/20">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false} // Allow smooth transitions globally if needed
        >
          <ReactQueryProvider>
            <GlobalBookingWrapper>
              {/* Main App Container with Safe Area Adjustments */}
              <main className="flex-1 flex flex-col w-full max-w-md mx-auto relative overflow-x-hidden bg-background shadow-2xl pb-[calc(env(safe-area-inset-bottom)+80px)] pt-[env(safe-area-inset-top)] min-h-screen">
                {children}
              </main>
              <BottomNav />
            </GlobalBookingWrapper>
          </ReactQueryProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
