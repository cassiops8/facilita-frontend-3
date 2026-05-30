import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Send, 
  Hash, 
  Users, 
  Settings,
  MoreVertical,
  Reply,
  Edit3,
  Trash2,
  X
} from 'lucide-react'

export default function ChatInterno({ funcionaria, isOpen, onClose }) {
  const [grupos, setGrupos] = useState([])
  const [grupoAtivo, setGrupoAtivo] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarNovoGrupo, setMostrarNovoGrupo] = useState(false)
  const [novoGrupo, setNovoGrupo] = useState({ nome: '', descricao: '', cor: '#8B4513' })
  const [funcionarias, setFuncionarias] = useState([])
  const [busca, setBusca] = useState('')
  const [estatisticas, setEstatisticas] = useState({})
  
  const mensagensRef = useRef(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }


  useEffect(() => {
    if (isOpen && funcionaria) {
      carregarDados()
      carregarFuncionarias()
      carregarEstatisticas()
    }
  }, [isOpen, funcionaria])

  useEffect(() => {
    if (grupoAtivo) {
      carregarMensagens()
      marcarTodasComoLidas()
    }
  }, [grupoAtivo])

  useEffect(() => {
    // Auto-scroll para a última mensagem
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight
    }
  }, [mensagens])

  const carregarDados = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat/grupos?funcionaria_id=${funcionaria.id}`, { headers: getAuthHeaders() })
      const data = await response.json()
      setGrupos(Array.isArray(data) ? data : [])
      
      // Selecionar primeiro grupo se não houver nenhum ativo
      if (data.length > 0 && !grupoAtivo) {
        setGrupoAtivo(Array.isArray(data) && data.length > 0 ? data[0] : null)
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
    }
  }

  const carregarFuncionarias = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/funcionarias`, { headers: getAuthHeaders() })
      const data = await response.json()
      setFuncionarias(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar funcionárias:', error)
    }
  }

  const carregarEstatisticas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat/estatisticas/${funcionaria.id}`, { headers: getAuthHeaders() })
      const data = await response.json()
      setEstatisticas(data && typeof data === 'object' ? data : {})
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const carregarMensagens = async () => {
    if (!grupoAtivo) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat/grupos/${grupoAtivo.id}/mensagens?limite=50`, { headers: getAuthHeaders() })
      const data = await response.json()
      setMensagens(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const marcarTodasComoLidas = async () => {
    if (!grupoAtivo) return
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat/grupos/${grupoAtivo.id}/marcar-todas-lidas`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ funcionaria_id: funcionaria.id })
      })
      carregarEstatisticas()
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error)
    }
  }

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !grupoAtivo) return

    setCarregando(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat/grupos/${grupoAtivo.id}/mensagens`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          remetente_id: funcionaria.id,
          conteudo: novaMensagem,
          tipo: 'texto'
        })
      })

      if (response.ok) {
        setNovaMensagem('')
        carregarMensagens()
        carregarEstatisticas()
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setCarregando(false)
    }
  }

  const criarGrupo = async () => {
    if (!novoGrupo.nome.trim()) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat/grupos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...novoGrupo,
          criado_por: funcionaria.id
        })
      })

      if (response.ok) {
        setMostrarNovoGrupo(false)
        setNovoGrupo({ nome: '', descricao: '', cor: '#8B4513' })
        carregarDados()
      }
    } catch (error) {
      console.error('Erro ao criar grupo:', error)
    }
  }

  const formatarHora = (dataString) => {
    const data = new Date(dataString)
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatarData = (dataString) => {
    const data = new Date(dataString)
    const hoje = new Date()
    const ontem = new Date(hoje)
    ontem.setDate(hoje.getDate() - 1)

    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje'
    } else if (data.toDateString() === ontem.toDateString()) {
      return 'Ontem'
    } else {
      return data.toLocaleDateString('pt-BR')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex overflow-hidden">
        
        {/* Sidebar - Lista de Grupos */}
        <div className="w-80 bg-muted/30 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">Chat Interno</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Button 
                size="sm" 
                onClick={() => setMostrarNovoGrupo(true)}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Grupo
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar grupos..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {(Array.isArray(grupos) ? grupos : []).filter(grupo => 
              grupo.nome.toLowerCase().includes(busca.toLowerCase())
            ).map((grupo) => (
              <div
                key={grupo.id}
                onClick={() => setGrupoAtivo(grupo)}
                className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                  grupoAtivo?.id === grupo.id 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: grupo.cor }}
                  >
                    {grupo.tipo === 'geral' ? <Hash className="h-4 w-4" /> : grupo.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {grupo.nome}
                      </h4>
                      {grupo.mensagens_nao_lidas > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {grupo.mensagens_nao_lidas}
                        </Badge>
                      )}
                    </div>
                    {grupo.ultima_mensagem && (
                      <p className="text-xs text-muted-foreground truncate">
                        {grupo.ultima_mensagem.remetente_nome}: {grupo.ultima_mensagem.conteudo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Estatísticas */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>📊 {estatisticas.total_grupos} grupos</div>
              <div>💬 {estatisticas.mensagens_nao_lidas} não lidas</div>
            </div>
          </div>
        </div>

        {/* Área Principal - Chat */}
        <div className="flex-1 flex flex-col">
          {grupoAtivo ? (
            <>
              {/* Header do Chat */}
              <div className="p-4 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: grupoAtivo.cor }}
                    >
                      {grupoAtivo.tipo === 'geral' ? <Hash className="h-4 w-4" /> : grupoAtivo.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{grupoAtivo.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {grupoAtivo.total_membros} membros
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div 
                ref={mensagensRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {mensagens.map((mensagem, index) => {
                  const mostrarData = index === 0 || 
                    formatarData(mensagens[index - 1].data_envio) !== formatarData(mensagem.data_envio)
                  
                  return (
                    <div key={mensagem.id}>
                      {mostrarData && (
                        <div className="text-center my-4">
                          <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                            {formatarData(mensagem.data_envio)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {(mensagem.remetente_nome || '?').split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm text-foreground">
                              {mensagem.remetente_nome}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatarHora(mensagem.data_envio)}
                            </span>
                            {mensagem.editada && (
                              <span className="text-xs text-muted-foreground">(editada)</span>
                            )}
                          </div>
                          <div className="text-sm text-foreground">
                            {mensagem.resposta_para && (
                              <div className="bg-muted/50 border-l-2 border-primary/50 pl-3 py-1 mb-2 text-xs">
                                <span className="font-medium">
                                  {mensagem.mensagem_original?.remetente_nome}:
                                </span>
                                <span className="ml-1">
                                  {mensagem.mensagem_original?.conteudo}
                                </span>
                              </div>
                            )}
                            {mensagem.conteudo}
                          </div>
                        </div>
                        {mensagem.remetente_id === funcionaria.id && (
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Input de Mensagem */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder={`Mensagem para #${grupoAtivo.nome}`}
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        enviarMensagem()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={enviarMensagem}
                    disabled={carregando || !novaMensagem.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um grupo para começar a conversar</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Grupo */}
      {mostrarNovoGrupo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Criar Novo Grupo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Grupo</label>
                <Input
                  placeholder="Ex: Equipe Marketing"
                  value={novoGrupo.nome}
                  onChange={(e) => setNovoGrupo({...novoGrupo, nome: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição (opcional)</label>
                <Input
                  placeholder="Descrição do grupo"
                  value={novoGrupo.descricao}
                  onChange={(e) => setNovoGrupo({...novoGrupo, descricao: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cor do Grupo</label>
                <Input
                  type="color"
                  value={novoGrupo.cor}
                  onChange={(e) => setNovoGrupo({...novoGrupo, cor: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setMostrarNovoGrupo(false)}>
                  Cancelar
                </Button>
                <Button onClick={criarGrupo} disabled={!novoGrupo.nome.trim()}>
                  Criar Grupo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

