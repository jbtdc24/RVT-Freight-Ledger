import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/app-layout';
import { ThemeProvider } from '@/components/theme-provider';
import { DataProvider } from '@/lib/data-context';
import { AuthProvider } from '@/lib/contexts/auth-context';

export const metadata: Metadata = {
  title: 'RVT Accounting',
  description: 'Freight and expense tracking for your trucking business.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <DataProvider>
              {/* Only render AppLayout if they are essentially 'in' the app, handled later. For now wrap all */}
              <AppLayout>
                {children}
              </AppLayout>
            </DataProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
