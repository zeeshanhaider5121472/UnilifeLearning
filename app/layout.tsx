import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
// @ts-ignore: support global CSS import in TypeScript
import "./globals.css";

export const metadata: Metadata = {
  title: "ResultHub — Student Results Management",
  description: "A modern student results management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
