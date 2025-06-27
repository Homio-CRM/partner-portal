import { type NextRequest, NextResponse } from "next/server"

const DIRECTUS_BASE_URL = process.env.DIRECTUS_BASE_URL
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN

const getHeaders = () => ({
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  "Content-Type": "application/json",
})

type Client = {
  status: string
  commissionPercentage?: number
  totalAmountReceived?: number
}

type Payment = {
  amount?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    if (!name) {
      return NextResponse.json({ error: "name é obrigatório" }, { status: 400 })
    }
    const clientsResponse = await fetch(
      `${DIRECTUS_BASE_URL}/clients?filter[partnerHpn][_eq]=${name}&filter[partnerHpn][_neq]=Homio&filter[useForMetrics][_neq]=false`,
      { headers: getHeaders() },
    )
    const clientsData = await clientsResponse.json()
    const clients = (clientsData.data ?? []) as Client[]

    const paymentsResponse = await fetch(
      `${DIRECTUS_BASE_URL}/partner_payments?filter[partnerHpn][_eq]=${name}`,
      { headers: getHeaders() },
    )
    const paymentsData = await paymentsResponse.json()
    const payments = (paymentsData.data ?? []) as Payment[]

    const totalClients = clients.length
    const canceledClients = clients.filter(client => client.status === "canceled")
    const churnRate = totalClients > 0 ? (canceledClients.length / totalClients) * 100 : 0

    const totalCommission = clients.reduce((sum, client) => {
      const commissionRate = client.commissionPercentage ? client.commissionPercentage / 100 : 0.2
      return sum + (client.totalAmountReceived ?? 0) * commissionRate
    }, 0)

    const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0)
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
