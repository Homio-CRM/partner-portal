"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  id: string
  partnerName: string
  amount: number
  date: string
  status: string
  description?: string
}

interface PartnerBalance {
  partnerId: string
  partnerName: string
  totalCommission: number
  totalPaid: number
  pendingAmount: number
}

interface PaymentsManagementProps {
  onStatsUpdate: () => void
}

export default function PaymentsManagement({ onStatsUpdate }: PaymentsManagementProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [balances, setBalances] = useState<PartnerBalance[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [selectedPartner, setSelectedPartner] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newPayment, setNewPayment] = useState({
    partnerId: "",
    amount: "",
    date: "",
    description: "",
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [paymentsRes, balancesRes, partnersRes] = await Promise.all([
        fetch("/api/admin/payments"),
        fetch("/api/admin/partner-balances"),
        fetch("/api/admin/partners"),
      ])

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData)
      }

      if (balancesRes.ok) {
        const balancesData = await balancesRes.json()
        setBalances(balancesData)
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

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPayment,
          amount: Number.parseFloat(newPayment.amount),
        }),
      })

      if (response.ok) {
        toast({
          title: "Pagamento registrado!",
          description: "O pagamento foi registrado com sucesso.",
        })
        setNewPayment({ partnerId: "", amount: "", date: "", description: "" })
        setShowAddDialog(false)
        loadData()
        onStatsUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Erro ao registrar pagamento",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      })
    }
  }

  const filteredPayments =
    selectedPartner === "all" ? payments : payments.filter((payment) => payment.partnerName === selectedPartner)

  const filteredBalances =
    selectedPartner === "all" ? balances : balances.filter((balance) => balance.partnerName === selectedPartner)

  if (loading) {
    return <div>Carregando pagamentos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                filteredBalances.reduce((sum, balance) => sum + balance.pendingAmount, 0),
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                filteredBalances.reduce((sum, balance) => sum + balance.totalPaid, 0),
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                filteredBalances.reduce((sum, balance) => sum + balance.totalCommission, 0),
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Saldos dos Parceiros</CardTitle>
              <CardDescription>Acompanhe o que deve ser pago a cada parceiro</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger className="w-48">
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
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Pagamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Novo Pagamento</DialogTitle>
                    <DialogDescription>Registre um pagamento feito a um parceiro</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPayment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="partner">Parceiro</Label>
                      <Select
                        value={newPayment.partnerId}
                        onValueChange={(value) => setNewPayment({ ...newPayment, partnerId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um parceiro" />
                        </SelectTrigger>
                        <SelectContent>
                          {partners.map((partner) => (
                            <SelectItem key={partner.id} value={partner.id}>
                              {partner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newPayment.date}
                        onChange={(e) =>
                          setNewPayment({ ...newPayment, date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição (opcional)</Label>
                      <Input
                        id="description"
                        value={newPayment.description}
                        onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                        placeholder="Ex: Comissões de Janeiro"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Registrar Pagamento
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parceiro</TableHead>
                <TableHead>Comissão Total</TableHead>
                <TableHead>Total Pago</TableHead>
                <TableHead>Pendente</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBalances.map((balance) => (
                <TableRow key={balance.partnerId}>
                  <TableCell className="font-medium">{balance.partnerName}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      balance.totalCommission,
                    )}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(balance.totalPaid)}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      balance.pendingAmount,
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={balance.pendingAmount > 0 ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-100" : "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"}>
                      {balance.pendingAmount > 0 ? "Pendente" : "Em dia"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>Todos os pagamentos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parceiro</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.partnerName}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payment.amount)}
                  </TableCell>
                  <TableCell>{(() => {
                      const d = new Date(payment.date);
                      d.setDate(d.getDate() + 1);
                      return d.toLocaleDateString("pt-BR");
                    })()}
                  </TableCell>
                  <TableCell>{payment.description || "-"}</TableCell>
                  <TableCell>
                    <Badge className={payment.status === "paid" ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100" : "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"}>
                      {payment.status === "paid" ? "Pago" : "Pendente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
