import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Search,
  MessageCircle,
  Settings,
  LogOut,
  Phone,
  Clock,
  User,
  Send,
  UserPlus
} from 'lucide-react'
import facilitaLogo from '../assets/facilita-logo.jpeg'
import CalendarioAgenda from './CalendarioAgenda'

export default function Dashboard({ funcionaria, onLogout, isViewing }) {
  const [clientes, setClientes] = useState([])
  const [agendamentos, setAgendamentos] = useState([])
  const [conversas, setConversas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [conversaSelecionada, setConversaSelecionada] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')

  useEffect(() => {
    carregarDados()
  }, [funcionaria.id])

  const carregarDados = async () => {
    try {
      const clientesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/clientes?funcionaria_id=${funcionaria.id}`)
      const clientesData = await clientesResponse.json()
      setClientes(clientesData)

      const agendamentosResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/agendamentos?funcionaria_id=${funcionaria.id}`)
      const agendamentosData = await agendamentosResponse.json()
      setAgendamentos(agendamentosData)

      const conversasResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/conversas?funcionaria_id=${funcionaria.id}&ativas_apenas=true`)
      const conversasData = await conversasResponse.json()
      setConversas(conversasData)

      if (clientesData.length > 0) {
        setClienteSelecionado(clientesData[0])
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setCarregando(false)
    }
  }

  const abrirWhatsApp = (numero) => {
    const numeroLimpo = numero.replace(/\D/g, '')
    window.open(`https://wa.me/${numeroLimpo}`, '_blank')
  }

  const carregarMensagens = async (conversaId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/conversas/${conversaId}/mensagens`)
      const data = await response.json()
      setMensagens(data)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada) return

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/conversas/${conversaSelecionada.id}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conteudo: novaMensagem,
          remetente: 'funcionaria',
          funcionaria_id: funcionaria.id
        })
      })
      
      setNovaMensagem('')
      carregarMensagens(conversaSelecionada.id)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return 'bg-blue-500'
      case 'confirmado': return 'bg-green-500'
      case 'cancelado': return 'bg-red-500'
      case 'realizado': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary/20 border-b border-border">
        <div className="flex justify-between items-center h-16 px-6">
          <div className="flex items-center space-x-4">
            <img 
              src={facilitaLogo} 
              alt="Facilita AR" 
              className="h-8 w-auto object-contain"
            />
            <span className="text-lg font-medium text-foreground">Assistentes Remotos</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar" 
                className="pl-10 w-64 bg-primary/10 border-primary/20"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Lista de Clientes */}
        <div className="w-80 bg-card border-r border-border">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h2 className="font-semibold text-foreground">Lista de Clientes</h2>
            <Button size="sm" variant="outline">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-y-auto h-full">
            {clientes.map((cliente) => (
              <div 
                key={cliente.id} 
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                  clienteSelecionado?.id === cliente.id ? 'bg-primary/10' : ''
                }`}
                onClick={() => setClienteSelecionado(cliente)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {cliente.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{cliente.nome}</h4>
                    <p className="text-sm text-muted-foreground">{cliente.tipo_profissional}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área Central - Agenda */}
        <div className="flex-1 p-6">
          {clienteSelecionado && (
            <div className="mb-6 p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-2">Cliente Selecionado: {clienteSelecionado.nome}</h3>
              <p className="text-sm text-muted-foreground mb-4">{clienteSelecionado.tipo_profissional} - {clienteSelecionado.email}</p>
              <div className="flex space-x-2">
                <Button size="sm" variant="default" onClick={() => abrirWhatsApp(clienteSelecionado.telefone)}>
                  <Phone className="h-4 w-4 mr-2" />
                  Abrir WhatsApp
                </Button>
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Configurar IA
                </Button>
                <Button size="sm" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Agendar
                </Button>
              </div>
            </div>
          )}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Agenda</h2>
            <CalendarioAgenda funcionariaId={funcionaria.id} clientes={clientes} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Acompanhamento</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="font-medium text-foreground mb-2">Novo</h3>
                <div className="space-y-2">
                  <div className="bg-muted rounded p-2">
                    <p className="text-sm text-foreground">Consulta de follow-up</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="font-medium text-foreground mb-2">Em atendimento</h3>
                <div className="space-y-2">
                  <div className="bg-primary/20 rounded p-2">
                    <p className="text-sm text-foreground">Limpeza de pele</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="font-medium text-foreground mb-2">Agendado</h3>
                <div className="space-y-2">
                  <div className="bg-muted rounded p-2">
                    <p className="text-sm text-foreground">Reunião</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="font-medium text-foreground mb-2">Concluído</h3>
                <div className="space-y-2">
                  <div className="bg-green-100 rounded p-2">
                    <p className="text-sm text-foreground">Consulta</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Direita - Conversas */}
        <div className="w-80 bg-card border-l border-border">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Conversas</h2>
          </div>
          
          {/* Lista de Conversas */}
          <div className="h-64 overflow-y-auto border-b border-border">
            {conversas.map((conversa) => (
              <div 
                key={conversa.id}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                  conversaSelecionada?.id === conversa.id ? 'bg-primary/10' : ''
                }`}
                onClick={() => {
                  setConversaSelecionada(conversa)
                  carregarMensagens(conversa.id)
                }}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {conversa.nome_contato.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{conversa.nome_contato}</h4>
                    <p className="text-xs text-muted-foreground">
                      {conversa.ultima_mensagem?.conteudo?.substring(0, 30)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Area */}
          {conversaSelecionada && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border bg-primary/10">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {conversaSelecionada.nome_contato.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-foreground">{conversaSelecionada.nome_contato}</h4>
                    <p className="text-xs text-muted-foreground">
                      {conversaSelecionada.modo_ia ? 'IA ativa' : 'Modo manual'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {mensagens.map((mensagem) => (
                  <div 
                    key={mensagem.id}
                    className={`flex ${mensagem.remetente === 'cliente' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-xs rounded-lg p-3 ${
                      mensagem.remetente === 'cliente' 
                        ? 'bg-muted text-foreground' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      <p className="text-sm">{mensagem.conteudo}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(mensagem.data_envio).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de Mensagem */}
              <div className="p-4 border-t border-border">
                <div className="flex space-x-2">
                  <Input
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                    className="flex-1"
                  />
                  <Button onClick={enviarMensagem} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


