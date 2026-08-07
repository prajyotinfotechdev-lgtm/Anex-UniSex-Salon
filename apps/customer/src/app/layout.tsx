import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Toaster } from "@/components/ui/toaster";
import { GlobalBookingWrapper } from "@/components/layout/global-booking-wrapper";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { SplashScreen } from "@/components/ui/splash-screen";
import { PwaInstallPrompt } from "@/components/ui/pwa-install-prompt";
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
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
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
        {/* Manual Service Worker Registration - reliable across all hosts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered:', registration.scope);
                  }).catch(function(err) {
                    console.error('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
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
                <SplashScreen>
                  {children}
                </SplashScreen>
              </main>
              <BottomNav />
            </GlobalBookingWrapper>
          </ReactQueryProvider>
          <Toaster position="top-center" />
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
