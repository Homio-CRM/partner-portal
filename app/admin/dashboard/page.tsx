"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, CreditCard, TrendingUp, LogOut } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PartnersManagement from "@/components/partners-management"
import SalesOverview from "@/components/sales-overview"
import PaymentsManagement from "@/components/payments-management"
import ProfileDropdown from "@/components/profile-dropdown"

interface DashboardStats {
  totalPartners: number
  totalRevenue: number
  totalClients: number
  pendingPayments: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalPartners: 0,
    totalRevenue: 0,
    totalClients: 0,
    pendingPayments: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.type !== "admin") {
      router.push("/partner/dashboard")
      return
    }

    setUser(parsedUser)
    loadStats()
  }, [router])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
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
                <p className="text-sm text-gray-600">Homio - Administração</p>
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
              <CardTitle className="text-sm font-medium">Total de Parceiros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPartners}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.pendingPayments)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="partners" className="space-y-6">
          <TabsList>
            <TabsTrigger value="partners">Parceiros</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="partners">
            <PartnersManagement onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="sales">
            <SalesOverview />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsManagement onStatsUpdate={loadStats} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
