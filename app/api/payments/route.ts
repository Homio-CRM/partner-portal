import { type NextRequest, NextResponse } from "next/server"
import { directusApi } from "@/lib/axios-config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partnerHpn = searchParams.get("partnerHpn")
    
    let url = "/partner_payments"
    if (partnerHpn) {
      url += `?filter[partnerHpn][_eq]=${partnerHpn}`
    }

    const response = await directusApi.get(url)
    return NextResponse.json(response.data.data || [])
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json()

    const response = await directusApi.post("/partner_payments", paymentData)
    return NextResponse.json(response.data.data)
  } catch (error) {
    console.error("Erro ao criar pagamento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 