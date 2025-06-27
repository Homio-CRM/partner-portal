"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, Key, LogOut, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProfileDropdownProps {
  user: any
  onLogout: () => void
}

export default function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { toast } = useToast()

  const resetForm = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setError("")
    setSuccess("")
  }

  const handleDialogClose = (open: boolean) => {
    setShowPasswordDialog(open)
    if (!open) {
      resetForm()
    }
  }

  const validateForm = () => {
    if (!passwordForm.currentPassword.trim()) {
      setError("Digite sua senha atual")
      return false
    }

    if (!passwordForm.newPassword.trim()) {
      setError("Digite uma nova senha")
      return false
    }

    if (passwordForm.newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres")
      return false
    }

    if (!passwordForm.confirmPassword.trim()) {
      setError("Confirme sua nova senha")
      return false
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("A nova senha e confirmação não coincidem")
      return false
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError("A nova senha deve ser diferente da senha atual")
      return false
    }

    return true
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Senha alterada com sucesso!")
        toast({
          title: "Sucesso!",
          description: "Senha alterada com sucesso",
        })

        // Fechar modal após 2 segundos
        setTimeout(() => {
          setShowPasswordDialog(false)
          resetForm()
        }, 2000)
      } else {
        // Mostrar erro específico do servidor
        const errorMessage = data.error || "Erro ao alterar senha"
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro na requisição:", error)
      const errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
      setError(errorMessage)
      toast({
        title: "Erro de Conexão",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <Badge
          className={
            user.type === "admin"
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
              : "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0"
          }
        >
          {user.type === "admin" ? "Admin" : "Parceiro"}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-gray-700"
            >
              <span className="text-sm font-medium">{user?.name}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-white/95 backdrop-blur-sm border border-purple-100 shadow-lg"
          >
            <DropdownMenuItem
              onClick={() => setShowPasswordDialog(true)}
              className="flex items-center space-x-2 cursor-pointer text-gray-700"
            >
              <Key className="w-4 h-4" />
              <span>Alterar Senha</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-purple-100" />
            <DropdownMenuItem
              onClick={onLogout}
              className="flex items-center space-x-2 cursor-pointer hover:bg-red-50 text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showPasswordDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border border-purple-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Alterar Senha</DialogTitle>
            <DialogDescription>Digite sua senha atual e escolha uma nova senha</DialogDescription>
          </DialogHeader>

          {/* Alert de Erro */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Alert de Sucesso */}
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="font-medium text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-gray-700 font-medium">
                Senha Atual *
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  setError("") // Limpar erro ao digitar
                }}
                required
                disabled={loading}
                className={`${
                  error && !passwordForm.currentPassword ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="Digite sua senha atual"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                Nova Senha *
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  setError("") // Limpar erro ao digitar
                }}
                required
                disabled={loading}
                minLength={6}
                className={`${
                  error && passwordForm.newPassword.length < 6 ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirmar Nova Senha *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  setError("") // Limpar erro ao digitar
                }}
                required
                disabled={loading}
                minLength={6}
                className={`${
                  error && passwordForm.newPassword !== passwordForm.confirmPassword
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                placeholder="Digite a nova senha novamente"
              />
            </div>

            <div className="flex space-x-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(false)}
                disabled={loading}
                className="flex-1 border-gray-200 text-black hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || success !== ""}
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Alterando...</span>
                  </div>
                ) : (
                  "Alterar Senha"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
