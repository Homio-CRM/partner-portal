"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Sale {
  id: string
  clientName: string
  partnerName: string
  plan: string
  status: string
  totalAmountReceived: number
  monthlyAmount: number
  startDate: string
  commission: number
  commissionPercentage: number
}

export default function SalesOverview() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [selectedPartner, setSelectedPartner] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterSales()
  }, [sales, selectedPartner, selectedStatus, searchTerm])

  const loadData = async () => {
    try {
      const [salesRes, partnersRes] = await Promise.all([fetch("/api/admin/sales"), fetch("/api/admin/partners")])

      if (salesRes.ok) {
        const salesData = await salesRes.json()
        setSales(salesData)
      }

      if (partnersRes.ok) {
        const partnersData = await partnersRes.json()
        setPartners(partnersData)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterSales = () => {
    let filtered = sales

    if (selectedPartner !== "all") {
      filtered = filtered.filter((sale) => sale.partnerName === selectedPartner)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((sale) => sale.status === selectedStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.partnerName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredSales(filtered)
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
    return <div>Carregando vendas...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Vendas</CardTitle>
          <CardDescription>Acompanhe todas as vendas e comissões por parceiro</CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar por cliente ou parceiro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="partner-filter">Filtrar por Parceiro</Label>
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os parceiros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os parceiros</SelectItem>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.name}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="status-filter">Filtrar por Status</Label>
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
                  <SelectItem value="past_due">Vencido</SelectItem>
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
                <TableHead>Parceiro</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mensal</TableHead>
                <TableHead>Receita Total</TableHead>
                <TableHead>Comissão %</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Data de Entrada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.clientName}</TableCell>
                  <TableCell>{sale.partnerName}</TableCell>
                  <TableCell>{sale.plan}</TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(sale.monthlyAmount)}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      sale.totalAmountReceived,
                    )}
                  </TableCell>
                  <TableCell>{sale.commissionPercentage}%</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(sale.commission)}
                  </TableCell>
                  <TableCell>{new Date(sale.startDate).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
