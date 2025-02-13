import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(req: Request) {
  try {
    // Obtener número de teléfono del request
    const { phoneNumber } = await req.json()

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: "Falta el número de teléfono" }, { status: 400 })
    }

    // API Key de SMS77 (Usa tu clave correcta)
    const apiKey = "tVOwHxMTW6jPwjJSpMj7329vyVcZrNXxEjYkOS3hxZZ2ZxBbIZoBKI5rB1p7oI6K"

    // Generar código aleatorio de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Construir el mensaje
    const messageText = `Tu código de verificación es: ${verificationCode}`

    // Enviar el mensaje usando la API de SMS77
    const response = await axios.post(
      "https://gateway.sms77.io/api/sms",
      null, // No se envía body, solo parámetros en la URL
      {
        params: {
          p: apiKey,
          to: phoneNumber,
          text: messageText,
          json: 1, // Para recibir la respuesta en formato JSON
        },
      },
    )

    console.log("✅ Mensaje enviado con éxito:", response.data)

    return NextResponse.json({
      success: true,
      response: response.data,
      verificationCode, // En un sistema real, no deberías devolver este código en la respuesta
    })
  } catch (error: any) {
    console.error("❌ Error al enviar el mensaje:", error.response ? error.response.data : error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}

