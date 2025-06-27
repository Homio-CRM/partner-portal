import { type NextRequest, NextResponse } from "next/server"

const DIRECTUS_BASE_URL = process.env.DIRECTUS_BASE_URL
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN

const getHeaders = () => ({
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  "Content-Type": "application/json",
})

export async function GET(request: NextRequest) {
  try {
    // Buscar parceiros
    const partnersResponse = await fetch(`${DIRECTUS_BASE_URL}/partner_logins?filter[type][_eq]=partner`, {
      headers: getHeaders(),
    })
    const partnersData = await partnersResponse.json()
    const partners = partnersData.data || []

    // Buscar clientes (excluindo clientes da Homio)
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

    // Calcular saldos para cada parceiro
    const balances = partners.map((partner: any) => {
      const partnerClients = clients.filter((client: any) => client.partnerHpn === partner.name)
      const totalRevenue = partnerClients.reduce(
        (sum: number, client: any) => sum + (client.totalAmountReceived || 0),
        0,
      )

      // Calcular comissão baseada no commissionPercentage de cada cliente
      const totalCommission = partnerClients.reduce((sum: number, client: any) => {
        const commissionRate = client.commissionPercentage ? client.commissionPercentage / 100 : 0.2
        return sum + (client.totalAmountReceived || 0) * commissionRate
      }, 0)

      // Calcular total pago para este parceiro
      const partnerPayments = payments.filter((payment: any) => payment.partnerHpn === partner.name)
      const totalPaid = partnerPayments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)

      const pendingAmount = Math.max(0, totalCommission - totalPaid)

      return {
        partnerId: partner.id,
        partnerName: partner.name,
        totalCommission,
        totalPaid,
        pendingAmount,
      }
    })

    return NextResponse.json(balances)
  } catch (error) {
    console.error("Erro ao buscar saldos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
