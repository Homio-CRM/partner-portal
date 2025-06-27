import { type NextRequest, NextResponse } from "next/server"

const DIRECTUS_BASE_URL = process.env.DIRECTUS_BASE_URL
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN

const getHeaders = () => ({
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  "Content-Type": "application/json",
})

export async function GET(request: NextRequest) {
  try {
    // Buscar clientes (excluindo clientes da Homio)
    const clientsResponse = await fetch(`${DIRECTUS_BASE_URL}/clients?filter[partnerHpn][_neq]=Homio&filter[useForMetrics][_neq]=false`, {
      headers: getHeaders(),
    })
    const clientsData = await clientsResponse.json()
    const clients = clientsData.data || []

    // Buscar parceiros para obter nomes
    const partnersResponse = await fetch(`${DIRECTUS_BASE_URL}/partner_logins?filter[type][_eq]=partner`, {
      headers: getHeaders(),
    })
    const partnersData = await partnersResponse.json()
    const partners = partnersData.data || []

    // Criar mapa de parceiros para facilitar busca
    const partnersMap = partners.reduce((map: any, partner: any) => {
      map[partner.name] = partner.name
      return map
    }, {})

    // Transformar clientes em vendas com informações do parceiro
    const sales = clients.map((client: any) => {
      const partnerName = partnersMap[client.partnerHpn] || "Parceiro não encontrado"
      const commissionRate = client.commissionPercentage ? client.commissionPercentage / 100 : 0.2
      const commission = (client.totalAmountReceived || 0) * commissionRate

      return {
        id: client.homioId || client.id,
        clientName: client.name,
        partnerName,
        plan: client.plan,
        status: client.status,
        totalAmountReceived: client.totalAmountReceived || 0,
        monthlyAmount: client.monthlyAmount || 0,
        startDate: client.startDate,
        commission,
        commissionPercentage: client.commissionPercentage || 20,
      }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error("Erro ao buscar vendas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
