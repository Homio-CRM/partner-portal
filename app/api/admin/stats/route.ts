import { type NextRequest, NextResponse } from "next/server"

const DIRECTUS_BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_BASE_URL
const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN

const getHeaders = () => ({
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  "Content-Type": "application/json",
})

export async function GET(request: NextRequest) {
  try {
    // Buscar dados dos parceiros
    const partnersResponse = await fetch(`${DIRECTUS_BASE_URL}/partner_logins?filter[type][_eq]=partner`, {
      headers: getHeaders(),
    })
    const partnersData = await partnersResponse.json()
    const totalPartners = partnersData.data?.length || 0

    // Buscar dados dos clientes (excluindo clientes da Homio)
    const clientsResponse = await fetch(`${DIRECTUS_BASE_URL}/clients?filter[partnerHpn][_neq]=Homio&filter[useForMetrics][_neq]=false`, {
      headers: getHeaders(),
    })
    const clientsData = await clientsResponse.json()
    const clients = clientsData.data || []

    // Buscar pagamentos da tabela partner_payments
    const paymentsResponse = await fetch(`${DIRECTUS_BASE_URL}/partner_payments`, {
      headers: getHeaders(),
    })
    const paymentsData = await paymentsResponse.json()
    const payments = paymentsData.data || []

    const totalClients = clients.length
    const totalRevenue = clients.reduce((sum: number, client: any) => sum + (client.totalAmountReceived || 0), 0)

    // Calcular comissões totais baseadas no commissionPercentage de cada cliente
    const totalCommissions = clients.reduce((sum: number, client: any) => {
      const commissionRate = client.commissionPercentage ? client.commissionPercentage / 100 : 0.2
      return sum + (client.totalAmountReceived || 0) * commissionRate
    }, 0)

    const totalPaid = payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
    const pendingPayments = Math.max(0, totalCommissions - totalPaid)

    return NextResponse.json({
      totalPartners,
      totalRevenue,
      totalClients,
      pendingPayments,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
