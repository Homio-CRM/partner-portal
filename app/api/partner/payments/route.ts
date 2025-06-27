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

    // Buscar pagamentos do parceiro na tabela partner_payments
    const paymentsResponse = await fetch(`${DIRECTUS_BASE_URL}/partner_payments?filter[partnerHpn][_eq]=${name}`, {
      headers: getHeaders(),
    })
    const paymentsData = await paymentsResponse.json()
    const payments = paymentsData.data || []

    // Transformar dados para o formato esperado
    const formattedPayments = payments.map((payment: any) => ({
      id: payment.id,
      amount: payment.amount,
      date: payment.paymentDate,
      status: "paid",
      description: payment.description
    }))

    return NextResponse.json(formattedPayments)
  } catch (error) {
    console.error("Erro ao buscar pagamentos do parceiro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
