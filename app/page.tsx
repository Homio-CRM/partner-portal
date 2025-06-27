"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Phone, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showInactiveAccount, setShowInactiveAccount] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setShowInactiveAccount(false)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user))
        if (data.user.type === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/partner/dashboard")
        }
      } else {
        if (data.error === "account_inactive") {
          setShowInactiveAccount(true)
        } else {
          setError(data.error || "Erro ao fazer login")
        }
      }
    } catch (err) {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText("27995008068")
  }

  if (showInactiveAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 relative p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Image src="/favicon.svg" alt="Homio Logo" fill className="object-contain p-2" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Conta Inativa
            </CardTitle>
            <CardDescription className="text-lg font-medium text-purple-600">Portal HPN | Homio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <AlertDescription className="text-orange-800 font-medium">
                Sua conta ainda não foi ativada pela nossa equipe.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-gray-700">Para ativar sua conta, entre em contato conosco através do WhatsApp:</p>

              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-bold text-green-800">(27) 99500-8068</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPhoneNumber}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Nossa equipe irá verificar seus dados e ativar sua conta em breve.
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowInactiveAccount(false)}
                className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Voltar ao Login
              </Button>
              <Button
                onClick={() => window.open("https://wa.me/5527995008068", "_blank")}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                Abrir WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 relative">
              <Image src="/favicon.svg" alt="Homio Logo" fill className="object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl">Portal HPN</CardTitle>
          <CardDescription className="text-lg font-medium text-blue-600">Homio</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
