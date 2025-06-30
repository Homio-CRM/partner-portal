import { type NextRequest, NextResponse } from "next/server"

const DIRECTUS_BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_BASE_URL
const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN

const getHeaders = () => ({
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  "Content-Type": "application/json",
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")

    if (!name) {
      return NextResponse.json({ error: "name é obrigatório" }, { status: 400 })
    }

    // Buscar clientes do parceiro (excluindo clientes da Homio)
    const clientsResponse = await fetch(
      `${DIRECTUS_BASE_URL}/clients?filter[partnerHpn][_eq]=${name}&filter[partnerHpn][_neq]=Homio&filter[useForMetrics][_neq]=false`,
      {
        headers: getHeaders(),
      },
    )
    const clientsData = await clientsResponse.json()
    const clients = clientsData.data || []

    // Transformar dados para incluir comissão baseada no commissionPercentage
    const clientsWithCommission = clients.map((client: any) => {
      const commissionRate = client.commissionPercentage ? client.commissionPercentage / 100 : 0.2
      const commission = (client.totalAmountReceived || 0) * commissionRate

      return {
        id: client.homioId || client.id,
        name: client.name,
        plan: client.plan,
        status: client.status,
        totalAmountReceived: client.totalAmountReceived || 0,
        monthlyAmount: client.monthlyAmount || 0,
        startDate: client.startDate,
        commission,
        commissionPercentage: client.commissionPercentage || 20,
      }
    })

    return NextResponse.json(clientsWithCommission)
  } catch (error) {
    console.error("Erro ao buscar clientes do parceiro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
