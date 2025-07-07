import { type NextRequest, NextResponse } from "next/server"
import { directusApi } from "@/lib/axios-config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partnerHpn = searchParams.get("partnerHpn")
    
    // Sempre incluir os filtros padrão
    const filters = [
      "filter[partnerHpn][_neq]=Homio",
      "filter[useForMetrics][_neq]=false"
    ]
    
    // Adicionar filtro de parceiro se fornecido
    if (partnerHpn) {
      filters.push(`filter[partnerHpn][_eq]=${partnerHpn}`)
    }
    
    const url = `/clients?${filters.join("&")}`

    const response = await directusApi.get(url)
    return NextResponse.json(response.data.data || [])
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 