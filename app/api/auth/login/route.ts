import { type NextRequest, NextResponse } from "next/server"

const DIRECTUS_BASE_URL = process.env.DIRECTUS_BASE_URL
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Buscar usuário no Directus
    const response = await fetch(`${DIRECTUS_BASE_URL}/partner_logins?filter[login][_eq]=${email}`, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erro ao conectar com o servidor" }, { status: 500 })
    }

    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
    }

    const user = data.data[0]

    // Verificar senha (em produção, use hash)
    if (user.password !== password) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

    // Verificar se o usuário está ativo (apenas para parceiros)
    if (user.type === "partner" && !user.status) {
      return NextResponse.json(
        {
          error: "account_inactive",
          message: "Sua conta ainda não foi ativada",
        },
        { status: 403 },
      )
    }

    // Retornar dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login realizado com sucesso",
    })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
