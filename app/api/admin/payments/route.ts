import { type NextRequest, NextResponse } from "next/server"

const DIRECTUS_BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_BASE_URL
const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN

const getHeaders = () => ({
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  "Content-Type": "application/json",
})

export async function GET(request: NextRequest) {
  try {
    // Buscar pagamentos da tabela partner_payments
    const paymentsResponse = await fetch(`${DIRECTUS_BASE_URL}/partner_payments`, {
      headers: getHeaders(),
    })
    const paymentsData = await paymentsResponse.json()
    const payments = paymentsData.data || []

    // Buscar parceiros para obter nomes
    const partnersResponse = await fetch(`${DIRECTUS_BASE_URL}/partner_logins?filter[type][_eq]=partner`, {
      headers: getHeaders(),
    })
    const partnersData = await partnersResponse.json()
    const partners = partnersData.data || []

    // Criar mapa de parceiros
    const partnersMap = partners.reduce((map: any, partner: any) => {
      map[partner.name] = partner.name
      return map
    }, {})

    // Transformar pagamentos com nome do parceiro
    const paymentsWithPartnerName = payments.map((payment: any) => ({
      id: payment.id,
      partnerName: partnersMap[payment.partnerHpn] || "Parceiro não encontrado",
      amount: payment.amount,
      date: payment.paymentDate,
      status: "paid",
      description: payment.description,
    }))

    return NextResponse.json(paymentsWithPartnerName)
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { partnerId, amount, date, description } = await request.json()

    // Buscar dados do parceiro
    const partnerResponse = await fetch(`${DIRECTUS_BASE_URL}/partner_logins/${partnerId}`, {
      headers: getHeaders(),
    })
    const partnerData = await partnerResponse.json()

    if (!partnerData.data) {
      return NextResponse.json({ error: "Parceiro não encontrado" }, { status: 404 })
    }

    // Criar pagamento na tabela partner_payments
    const newPayment = {
      amount: amount,
      paymentDate: date, // Formato YYYY-MM-DD
      partnerHpn: partnerData.data.name,
      description: description
    }

    const response = await fetch(`${DIRECTUS_BASE_URL}/partner_payments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(newPayment),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: "Erro ao registrar pagamento" }, { status: 400 })
    }

    const createdPayment = await response.json()

    return NextResponse.json({
      id: createdPayment.data.id,
      partnerId,
      partnerName: newPayment.partnerHpn,
      amount,
      date: newPayment.paymentDate,
      status: "paid",
      description: newPayment.description,
    })
  } catch (error) {
    console.error("Erro ao registrar pagamento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
