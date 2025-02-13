"use client"

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#111b21] z-50">
      {/* Fondo con patrón de WhatsApp */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v4/yl/r/gi_DckOUM5a.png")',
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      />

      {/* Loader animado */}
      <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin z-10" />
    </div>
  )
}

