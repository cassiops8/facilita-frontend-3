import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import facilitaLogo from '../assets/facilita-logo.jpeg'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarRecuperacao, setMostrarRecuperacao] = useState(false)
  const [emailRecuperacao, setEmailRecuperacao] = useState('')
  const [carregandoRecuperacao, setCarregandoRecuperacao] = useState(false)
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const response = await fetch("${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (response.ok) {
        // Armazenar o token JWT no localStorage
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.funcionaria))
        onLogin(data.funcionaria)
      } else {
        setErro(data.erro || 'Erro ao fazer login')
      }
    } catch (error) {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const handleRecuperarSenha = async (e) => {
    e.preventDefault()
    setCarregandoRecuperacao(true)
    setMensagemRecuperacao('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/recuperar-senha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailRecuperacao }),
      })

      const data = await response.json()

      if (response.ok) {
        setMensagemRecuperacao(data.mensagem)
        setEmailRecuperacao('')
      } else {
        setMensagemRecuperacao(data.erro || 'Erro ao recuperar senha')
      }
    } catch (error) {
      setMensagemRecuperacao('Erro de conexão. Tente novamente.')
    } finally {
      setCarregandoRecuperacao(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={facilitaLogo} 
              alt="Facilita AR" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Sistema de Gestão
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Faça login para acessar o painel de controle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {erro && (
              <Alert variant="destructive">
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={carregando}
            >
              {carregando ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </div>
              )}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setMostrarRecuperacao(true)}
              >
                Esqueceu sua senha?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal de Recuperação de Senha */}
      {mostrarRecuperacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Recuperar Senha</CardTitle>
              <CardDescription>
                Digite seu email para receber instruções de recuperação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecuperarSenha} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailRecuperacao">Email</Label>
                  <Input
                    id="emailRecuperacao"
                    type="email"
                    placeholder="seu@email.com"
                    value={emailRecuperacao}
                    onChange={(e) => setEmailRecuperacao(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {mensagemRecuperacao && (
                  <Alert>
                    <AlertDescription>{mensagemRecuperacao}</AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={carregandoRecuperacao}
                  >
                    {carregandoRecuperacao ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      'Enviar'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMostrarRecuperacao(false)
                      setEmailRecuperacao('')
                      setMensagemRecuperacao('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

