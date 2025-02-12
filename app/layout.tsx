import { Inter } from "next/font/google"
import type { Metadata, Viewport } from "next"
import { ToastProvider } from "@/contexts/ToastContext"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

const ICON_URL =
  "https://firebasestorage.googleapis.com/v0/b/cargatusfichas24hs.firebasestorage.app/o/admin%2Ffavicon%20final.png?alt=media&token=4bd18c29-affc-42fa-a281-17fb2cbb6143"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b141a",
  viewportFit: "cover",
  minimumScale: 1,
}

export const metadata: Metadata = {
  title: "Cargatusfichas.com",
  description: "Envía y recibe mensajes sin mantener tu teléfono conectado",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cargatusfichas.com",
    startupImage: [ICON_URL],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: ICON_URL,
    shortcut: ICON_URL,
    apple: ICON_URL,
    other: {
      rel: "apple-touch-icon-precomposed",
      url: ICON_URL,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0b141a" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no, minimal-ui"
        />
        <link rel="apple-touch-icon" href={ICON_URL} />
        <link rel="apple-touch-icon-precomposed" href={ICON_URL} />
        <link rel="icon" type="image/png" href={ICON_URL} />
        <link rel="manifest" href="/manifest.json" />
        <style>{`
          :root {
            background: #0b141a;
          }
          html {
            background: #0b141a;
          }
          @media (display-mode: standalone) {
            html {
              -webkit-text-size-adjust: 100%;
              height: 100vh;
              overflow: hidden;
              background: #0b141a;
            }
            body {
              height: 100vh;
              overflow: hidden;
              -webkit-user-select: none;
              user-select: none;
              -webkit-tap-highlight-color: transparent;
              -webkit-touch-callout: none;
              background: #0b141a;
              padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
            }
            #__next {
              background: #0b141a;
            }
          }
        `}</style>
      </head>
      <body
        className={`${inter.className} h-full bg-[#0b141a]`}
        style={{
          backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v4/yl/r/gi_DckOUM5a.png")',
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      >
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  )
}



import './globals.css'