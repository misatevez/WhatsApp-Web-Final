"use client";

import { useState, useEffect } from "react";
import SplashScreen from "@/components/shared/SplashScreen";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/contexts/ToastContext";
import dynamic from "next/dynamic";

const Providers = dynamic(() => import("@/components/Providers"), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {!isLoaded ? <SplashScreen /> : (
        <AuthProvider>
          <AppProvider>
            <ToastProvider>
              <Providers>{children}</Providers>
            </ToastProvider>
          </AppProvider>
        </AuthProvider>
      )}
    </>
  );
}

