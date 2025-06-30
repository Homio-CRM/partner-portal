import { type NextRequest, NextResponse } from "next/server"

const DIRECTUS_BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_BASE_URL
const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json()

    // Buscar usuário atual
    const userResponse = await fetch(`${DIRECTUS_BASE_URL}/partner_logins/${userId}`, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const userData = await userResponse.json()
    const user = userData.data

    // Verificar senha atual
    if (user.password !== currentPassword) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 })
    }

    // Atualizar senha
    const updateResponse = await fetch(`${DIRECTUS_BASE_URL}/partner_logins/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    })

    if (!updateResponse.ok) {
      return NextResponse.json({ error: "Erro ao atualizar senha" }, { status: 500 })
    }

    return NextResponse.json({ message: "Senha alterada com sucesso" })
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
