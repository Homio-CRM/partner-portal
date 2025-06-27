"use client"

import React from "react"

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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Copy, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LinkInfo {
  url: string
  commission: number
  title: string
  description: string
}

interface Partner {
  id: string
  name: string
  email: string
  urlId: string
  totalClients: number
  totalRevenue: number
  totalCommission: number
  status: boolean
  cnpj: string
  pixKey: string
}

interface PartnersManagementProps {
  onStatsUpdate: () => void
}

export default function PartnersManagement({ onStatsUpdate }: PartnersManagementProps) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newPartner, setNewPartner] = useState({ name: "", email: "" })
  const [showLinks, setShowLinks] = useState<{ [key: string]: boolean }>({})
  const [updatingStatus, setUpdatingStatus] = useState<{ [key: string]: boolean }>({})
  const { toast } = useToast()

  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = async () => {
    try {
      const response = await fetch("/api/admin/partners")
      if (response.ok) {
        const data = await response.json()
        setPartners(data)
      }
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartner),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Parceiro adicionado!",
          description: `Login: ${data.login}, Senha: ${data.password}`,
        })
        setNewPartner({ name: "", email: "" })
        setShowAddDialog(false)
        loadPartners()
        onStatsUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Erro ao adicionar parceiro",
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

  const handleStatusToggle = async (partnerId: string, currentStatus: boolean) => {
    setUpdatingStatus({ ...updatingStatus, [partnerId]: true })

    try {
      const response = await fetch("/api/admin/partners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId,
          status: !currentStatus,
        }),
      })

      if (response.ok) {
        // Atualizar o estado local
        setPartners(
          partners.map((partner) => (partner.id === partnerId ? { ...partner, status: !currentStatus } : partner)),
        )
        toast({
          title: "Status atualizado!",
          description: `Parceiro ${!currentStatus ? "ativado" : "desativado"} com sucesso.`,
        })
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar status do parceiro",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus({ ...updatingStatus, [partnerId]: false })
    }
  }

  const generateLinkInfos = (nameId: string): LinkInfo[] => {
    const baseUrl = "https://homio.com.br/planos?"
    return [
      {
        url: `${baseUrl}${nameId}10`,
        commission: 10,
        title: "Indicação",
        description: "Empresa faz venda e suporte",
      },
      {
        url: `${baseUrl}${nameId}20`,
        commission: 20,
        title: "Venda",
        description: "Parceiro vende, empresa dá suporte",
      },
      {
        url: `${baseUrl}${nameId}40`,
        commission: 40,
        title: "Venda + Suporte",
        description: "Parceiro faz tudo",
      },
    ]
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: `${label} foi copiado para a área de transferência.`,
    })
  }

  const toggleShowLinks = (partnerId: string) => {
    setShowLinks((prev) => ({
      ...prev,
      [partnerId]: !prev[partnerId],
    }))
  }

  if (loading) {
    return <div>Carregando parceiros...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestão de Parceiros</CardTitle>
            <CardDescription>Adicione e gerencie seus parceiros</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-700">Nome</TableHead>
              <TableHead className="text-gray-700">Email</TableHead>
              <TableHead className="text-gray-700">Clientes</TableHead>
              <TableHead className="text-gray-700">Receita</TableHead>
              <TableHead className="text-gray-700">Comissão</TableHead>
              <TableHead className="text-gray-700">Status</TableHead>
              <TableHead className="text-gray-700">Links</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((partner) => (
              <React.Fragment key={partner.id}>
                <TableRow className="hover:bg-purple-50/50">
                  <TableCell className="font-medium text-gray-800">{partner.name}</TableCell>
                  <TableCell className="text-gray-700">{partner.email}</TableCell>
                  <TableCell className="text-gray-700">{partner.totalClients}</TableCell>
                  <TableCell className="text-gray-700">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      partner.totalRevenue,
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      partner.totalCommission,
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={
                          partner.status
                            ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                            : "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
                        }
                      >
                        {partner.status ? "Ativo" : "Inativo"}
                      </Badge>
                      <Switch
                        checked={partner.status}
                        onCheckedChange={() => handleStatusToggle(partner.id, partner.status)}
                        disabled={updatingStatus[partner.id]}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => toggleShowLinks(partner.id)}>
                      {showLinks[partner.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Linha expandida com CNPJ e PIX */}
                <TableRow className="bg-gray-50/50">
                  <TableCell colSpan={7} className="py-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">CNPJ:</span>
                        <span className="text-sm text-gray-800">{partner.cnpj || "Não informado"}</span>
                        {partner.cnpj && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(partner.cnpj, "CNPJ")}
                            className="h-6 px-2"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">PIX:</span>
                        <span className="text-sm text-gray-800">{partner.pixKey || "Não informado"}</span>
                        {partner.pixKey && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(partner.pixKey, "Chave PIX")}
                            className="h-6 px-2"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Links de afiliado */}
                    {showLinks[partner.id] && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Links de Afiliado:</h4>
                        {generateLinkInfos(partner.urlId).map((linkInfo, index) => (
                          <div key={index} className="border rounded p-2 text-xs bg-white">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                {linkInfo.commission}% - {linkInfo.title}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(linkInfo.url, linkInfo.title)}
                                className="h-6 px-2"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-gray-600">{linkInfo.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
