import { NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json()

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: "Falta el número de teléfono" }, { status: 400 })
    }

    // Valores hardcodeados para pruebas
    const accountSid = "AC16a8fee18ddb69547331a19d53ebbfc2"
    const authToken = "5e721397dd7a736f2975f154e070ee30"
    const from = "+14155238886"
    const contentSid = "HX229f5a04fd0510ce1b071852155d3e75"

    const client = twilio(accountSid, authToken)

    // Generar código aleatorio de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    try {
      // Enviar el mensaje usando plantilla aprobada
      const message = await client.messages.create({
        from: `whatsapp:${from}`,
        contentSid: contentSid,
        contentVariables: JSON.stringify({ "1": verificationCode }),
        to: `whatsapp:${phoneNumber}`,
      })

      console.log("Mensaje enviado con SID:", message.sid)

      return NextResponse.json({ success: true, sid: message.sid, verificationCode })
    } catch (twilioError: any) {
      console.error("Error de Twilio:", twilioError)
      return NextResponse.json(
        {
          success: false,
          error: twilioError.message || "Error al enviar el mensaje de Twilio",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error en el servidor:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}

