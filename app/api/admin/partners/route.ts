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

    // Buscar clientes para calcular estatísticas (excluindo clientes da Homio)
    const clientsResponse = await fetch(`${DIRECTUS_BASE_URL}/clients?filter[partnerHpn][_neq]=Homio&filter[useForMetrics][_neq]=false`, {
      headers: getHeaders(),
    })
    const clientsData = await clientsResponse.json()
    const clients = clientsData.data || []

    // Calcular estatísticas para cada parceiro
    const partnersWithStats = partners.map((partner: any) => {
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

      return {
        ...partner,
        totalClients: partnerClients.length,
        totalRevenue,
        totalCommission,
        status: partner.status || false,
        cnpj: partner.cnpj || "",
        pixKey: partner.pixKey || "",
      }
    })

    return NextResponse.json(partnersWithStats)
  } catch (error) {
    console.error("Erro ao buscar parceiros:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    // Gerar nameId (nome sem espaços e minúsculo)
    const nameId = name.toLowerCase().replace(/\s+/g, "")

    // Dados do novo parceiro
    const newPartner = {
      login: email,
      password: "123456", // Senha padrão
      name,
      nameId,
      type: "partner",
      status: false,
      cnpj: "",
      pixKey: "",
    }

    // Criar parceiro no Directus
    const response = await fetch(`${DIRECTUS_BASE_URL}/partner_logins`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(newPartner),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: "Erro ao criar parceiro" }, { status: 400 })
    }

    const createdPartner = await response.json()

    return NextResponse.json({
      ...createdPartner.data,
      login: email,
      password: "123456",
    })
  } catch (error) {
    console.error("Erro ao criar parceiro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { partnerId, status } = await request.json()

    // Atualizar status do parceiro
    const response = await fetch(`${DIRECTUS_BASE_URL}/partner_logins/${partnerId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erro ao atualizar status do parceiro" }, { status: 400 })
    }

    const updatedPartner = await response.json()
    return NextResponse.json(updatedPartner.data)
  } catch (error) {
    console.error("Erro ao atualizar parceiro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}