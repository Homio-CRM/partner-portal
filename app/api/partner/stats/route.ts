import { type NextRequest, NextResponse } from "next/server"

const DIRECTUS_BASE_URL = process.env.DIRECTUS_BASE_URL
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN

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

    // Buscar pagamentos do parceiro
    const paymentsResponse = await fetch(`${DIRECTUS_BASE_URL}/partner_payments?filter[partnerHpn][_eq]=${name}`, {
      headers: getHeaders(),
    })
    const paymentsData = await paymentsResponse.json()
    const payments = paymentsData.data || []

    const totalClients = clients.length

    // Calcular taxa de churn (total de clientes cancelados / total de clientes)
    const canceledClients = clients.filter((client) => client.status === "canceled")
    const churnRate = totalClients > 0 ? (canceledClients.length / totalClients) * 100 : 0

    // Calcular comissão baseada no commissionPercentage de cada cliente
    const totalCommission = clients.reduce((sum: number, client: any) => {
      const commissionRate = client.commissionPercentage ? client.commissionPercentage / 100 : 0.2
      return sum + (client.totalAmountReceived || 0) * commissionRate
    }, 0)

    // Calcular total já pago
    const totalPaid = payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
    const pendingPayment = Math.max(0, totalCommission - totalPaid)

    return NextResponse.json({
      totalClients,
      churnRate,
      totalCommission,
      pendingPayment,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas do parceiro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
