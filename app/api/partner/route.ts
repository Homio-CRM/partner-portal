import { type NextRequest, NextResponse } from "next/server"
import { directusApi } from "@/lib/axios-config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    
    let url = "/partner_logins"
    if (type) {
      url += `?filter[type][_eq]=${type}`
    }

    const response = await directusApi.get(url)
    return NextResponse.json(response.data.data || [])
  } catch (error) {
    console.error("Erro ao buscar parceiros:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const partnerData = await request.json()

    const response = await directusApi.post("/partner_logins", partnerData)
    return NextResponse.json(response.data.data)
  } catch (error) {
    console.error("Erro ao criar parceiro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 