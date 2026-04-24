import { AuthProvider } from "@/components/AuthProvider";
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
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1e1b4b",
                color: "#e2e8f0",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: "12px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
