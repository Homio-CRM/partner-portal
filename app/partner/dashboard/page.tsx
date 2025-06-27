"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, DollarSign, Users, TrendingDown, LogOut, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProfileDropdown from "@/components/profile-dropdown"

interface PartnerStats {
  totalClients: number
  churnRate: number
  totalCommission: number
  pendingPayment: number
}

interface Client {
  id: string
  name: string
  plan: string
  status: string
  totalAmountReceived: number
  monthlyAmount: number
  startDate: string
  commission: number
}

interface Payment {
  id: string
  amount: number
  date: string
  status: string
  description: string
}

interface LinkInfo {
  url: string
  commission: number
  title: string
  description: string
  usage: string
}

export default function PartnerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<PartnerStats>({
    totalClients: 0,
    churnRate: 0,
    totalCommission: 0,
    pendingPayment: 0,
  })
  const [clients, setClients] = useState<Client[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [links, setLinks] = useState<LinkInfo[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [filteredClients, setFilteredClients] = useState<Client[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.type !== "partner") {
      router.push("/admin/dashboard")
      return
    }

    setUser(parsedUser)
    loadPartnerData(parsedUser.name, parsedUser.urlId)
  }, [router])

  useEffect(() => {
    if (clients.length > 0) {
      if (selectedStatus === "all") {
        setFilteredClients(clients)
      } else {
        setFilteredClients(clients.filter((client) => client.status === selectedStatus))
      }
    }
  }, [clients, selectedStatus])

  const loadPartnerData = async (partnerName: string, nameId: string) => {
    try {
      const [statsRes, clientsRes, paymentsRes] = await Promise.all([
        fetch(`/api/partner/stats?name=${partnerName}`),
        fetch(`/api/partner/clients?name=${partnerName}`),
        fetch(`/api/partner/payments?name=${partnerName}`),
      ])

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData)
        setFilteredClients(clientsData)
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Gerar links com informações detalhadas
      const baseUrl = "https://homio.com.br/planos?"
      const linkInfos: LinkInfo[] = [
        {
          url: `${baseUrl}${nameId}10`,
          commission: 10,
          title: "Link de Indicação",
          description: "Para indicações de empresas",
          usage: "Use quando quiser apenas indicar uma empresa. A Homio fará a venda e todo o suporte.",
        },
        {
          url: `${baseUrl}${nameId}20`,
          commission: 20,
          title: "Link de Venda",
          description: "Para vendas diretas",
          usage: "Use quando você mesmo fizer a venda. A Homio ficará responsável pelo suporte ao cliente.",
        },
        {
          url: `${baseUrl}${nameId}40`,
          commission: 40,
          title: "Link de Venda + Suporte",
          description: "Para venda completa com suporte",
          usage: "Use quando você fizer a venda E for responsável pelo suporte completo ao cliente.",
        },
      ]
      setLinks(linkInfos)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Link copiado!",
      description: `${title} foi copiado para a área de transferência.`,
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Ativo</Badge>
      case "canceled":
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Cancelado</Badge>
      case "trialing":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Em teste</Badge>
      case "paused":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">Pausado</Badge>
      case "past_due":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">Vencido</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 relative">
                <Image src="/favicon.svg" alt="Homio Logo" fill className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Portal HPN</h1>
                <p className="text-sm text-gray-600">Homio</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ProfileDropdown user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meus Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.churnRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Clientes cancelados por total de clientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.totalCommission)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Receber</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.pendingPayment)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Meus Links de Afiliado</CardTitle>
              <CardDescription>Use estes links para divulgar e ganhar comissões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {links.map((link, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{link.commission}%</Badge>
                      <h4 className="font-medium">{link.title}</h4>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.url, link.title)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{link.description}</p>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">{link.usage}</AlertDescription>
                  </Alert>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimos Pagamentos</CardTitle>
              <CardDescription>Histórico de pagamentos recebidos</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                            payment.amount,
                          )}
                        </p>
                        <p className="text-xs text-gray-600">{(() => {
                          const d = new Date(payment.date);
                          d.setDate(d.getDate() + 1);
                          return d.toLocaleDateString("pt-BR");
                        })()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {payment.description}
                        </p>
                      </div>
                      <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                        {payment.status === "paid" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Nenhum pagamento encontrado.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Meus Clientes</CardTitle>
                <CardDescription>Lista de todos os seus clientes e suas comissões</CardDescription>
              </div>
              <div className="w-full sm:w-48">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="canceled">Cancelado</SelectItem>
                    <SelectItem value="trialing">Em teste</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="past_due">Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receita Total</TableHead>
                  <TableHead>Mensal</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Data de Entrada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.plan}</TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        client.totalAmountReceived,
                      )}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        client.monthlyAmount,
                      )}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(client.commission)}
                    </TableCell>
                    <TableCell>{new Date(client.startDate).toLocaleDateString("pt-BR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
