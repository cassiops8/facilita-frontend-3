import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  X, 
  Save, 
  Bot, 
  Settings, 
  TestTube,
  BarChart3,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react'

export default function ConfiguracaoIA({ isOpen, onClose, onSave }) {
  const [statusIA, setStatusIA] = useState({
    ia_configurada: false,
    ia_ativa: false,
    modelo: 'gpt-3.5-turbo',
    temperatura: 0.7,
    max_tokens: 500
  })
  
  const [configuracao, setConfiguracao] = useState({
    ia_ativa: false,
    modelo_ia: 'gpt-3.5-turbo',
    temperatura_ia: 0.7,
    max_tokens_ia: 500,
    prompt_personalizado: ''
  })
  
  const [prompts, setPrompts] = useState([])
  const [promptAtivo, setPromptAtivo] = useState('')
  const [mensagemTeste, setMensagemTeste] = useState('Olá, gostaria de agendar uma consulta')
  const [resultadoTeste, setResultadoTeste] = useState(null)
  const [estatisticas, setEstatisticas] = useState({})
  const [logs, setLogs] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [testando, setTestando] = useState(false)


  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  useEffect(() => {
    if (isOpen) {
      carregarDados()
    }
  }, [isOpen])

  const carregarDados = async () => {
    await Promise.all([
      carregarStatusIA(),
      carregarPrompts(),
      carregarEstatisticas(),
      carregarLogs()
    ])
  }

  const carregarStatusIA = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ia/status`, { headers: getAuthHeaders() })
      const data = await response.json()
      setStatusIA(data)
      setConfiguracao({
        ia_ativa: data.ia_ativa,
        modelo_ia: data.modelo,
        temperatura_ia: data.temperatura,
        max_tokens_ia: data.max_tokens,
        prompt_personalizado: ''
      })
    } catch (error) {
      console.error('Erro ao carregar status da IA:', error)
    }
  }

  const carregarPrompts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ia/prompts`, { headers: getAuthHeaders() })
      const data = await response.json()
      setPrompts(data)
    } catch (error) {
      console.error('Erro ao carregar prompts:', error)
    }
  }

  const carregarEstatisticas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ia/estatisticas`, { headers: getAuthHeaders() })
      const data = await response.json()
      setEstatisticas(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const carregarLogs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ia/logs?limite=20`, { headers: getAuthHeaders() })
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    }
  }

  const salvarConfiguracao = async () => {
    setCarregando(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ia/configurar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(configuracao)
      })

      const result = await response.json()
      if (result.sucesso) {
        alert('Configurações da IA salvas com sucesso!')
        carregarStatusIA()
        onSave && onSave()
      } else {
        alert(result.erro || 'Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setCarregando(false)
    }
  }

  const testarIA = async () => {
    setTestando(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ia/testar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mensagem: mensagemTeste })
      })

      const result = await response.json()
      setResultadoTeste(result)
    } catch (error) {
      console.error('Erro ao testar IA:', error)
      setResultadoTeste({
        sucesso: false,
        erro: 'Erro ao conectar com o servidor'
      })
    } finally {
      setTestando(false)
    }
  }

  const aplicarPrompt = async (promptId) => {
    try {
      const prompt = prompts.find(p => p.id === promptId)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ia/prompts/${promptId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ prompt: prompt?.prompt })
      })

      const result = await response.json()
      if (result.sucesso) {
        setPromptAtivo(promptId)
        alert(`Prompt "${prompt?.nome}" aplicado com sucesso!`)
      } else {
        alert(result.erro || 'Erro ao aplicar prompt')
      }
    } catch (error) {
      console.error('Erro ao aplicar prompt:', error)
      alert('Erro ao aplicar prompt')
    }
  }

  const formatarTempo = (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
              <Bot className="h-6 w-6" />
              <span>Configuração da IA</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure e monitore o assistente virtual inteligente
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Status & Config</span>
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Prompts</span>
              </TabsTrigger>
              <TabsTrigger value="estatisticas" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Estatísticas</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Logs</span>
              </TabsTrigger>
            </TabsList>

            {/* Aba Status & Configuração */}
            <TabsContent value="status" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${statusIA.ia_configurada ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>Status da IA</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${statusIA.ia_configurada ? 'text-green-600' : 'text-red-600'}`}>
                        {statusIA.ia_configurada ? <CheckCircle className="h-8 w-8 mx-auto" /> : <XCircle className="h-8 w-8 mx-auto" />}
                      </div>
                      <p className="text-sm text-muted-foreground">Configurada</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${statusIA.ia_ativa ? 'text-green-600' : 'text-gray-400'}`}>
                        {statusIA.ia_ativa ? <Zap className="h-8 w-8 mx-auto" /> : <XCircle className="h-8 w-8 mx-auto" />}
                      </div>
                      <p className="text-sm text-muted-foreground">Ativa</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {statusIA.modelo}
                      </div>
                      <p className="text-sm text-muted-foreground">Modelo</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {statusIA.api_key_presente ? '✓' : '✗'}
                      </div>
                      <p className="text-sm text-muted-foreground">API Key</p>
                    </div>
                  </div>

                  {statusIA.api_key_mascarada && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>API Key:</strong> {statusIA.api_key_mascarada}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>
                    Ajuste o comportamento da IA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={configuracao.ia_ativa}
                      onCheckedChange={(checked) => setConfiguracao({...configuracao, ia_ativa: checked})}
                    />
                    <Label>IA Ativa</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="modelo">Modelo</Label>
                      <select
                        id="modelo"
                        value={configuracao.modelo_ia}
                        onChange={(e) => setConfiguracao({...configuracao, modelo_ia: e.target.value})}
                        className="w-full p-2 border border-border rounded-md"
                      >
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="temperatura">Temperatura ({configuracao.temperatura_ia})</Label>
                      <Input
                        id="temperatura"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={configuracao.temperatura_ia}
                        onChange={(e) => setConfiguracao({...configuracao, temperatura_ia: parseFloat(e.target.value)})}
                      />
                      <p className="text-xs text-muted-foreground">0 = Conservadora, 1 = Criativa</p>
                    </div>

                    <div>
                      <Label htmlFor="max_tokens">Max Tokens</Label>
                      <Input
                        id="max_tokens"
                        type="number"
                        min="100"
                        max="2000"
                        value={configuracao.max_tokens_ia}
                        onChange={(e) => setConfiguracao({...configuracao, max_tokens_ia: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={salvarConfiguracao} disabled={carregando}>
                      <Save className="h-4 w-4 mr-2" />
                      {carregando ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Teste da IA</CardTitle>
                  <CardDescription>
                    Teste o funcionamento da IA com uma mensagem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="mensagem_teste">Mensagem de Teste</Label>
                    <Textarea
                      id="mensagem_teste"
                      placeholder="Digite uma mensagem para testar a IA..."
                      value={mensagemTeste}
                      onChange={(e) => setMensagemTeste(e.target.value)}
                    />
                  </div>

                  <Button onClick={testarIA} disabled={testando || !mensagemTeste.trim()}>
                    <TestTube className="h-4 w-4 mr-2" />
                    {testando ? 'Testando...' : 'Testar IA'}
                  </Button>

                  {resultadoTeste && (
                    <div className={`p-4 rounded-lg border ${resultadoTeste.sucesso ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {resultadoTeste.sucesso ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium">
                          {resultadoTeste.sucesso ? 'Teste bem-sucedido' : 'Teste falhou'}
                        </span>
                        <Badge variant={resultadoTeste.tipo === 'openai' ? 'default' : 'secondary'}>
                          {resultadoTeste.tipo}
                        </Badge>
                      </div>
                      
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm"><strong>Resposta:</strong></p>
                        <p className="mt-1">{resultadoTeste.resposta}</p>
                      </div>

                      {resultadoTeste.erro_openai && (
                        <div className="mt-2 text-sm text-red-600">
                          <strong>Erro OpenAI:</strong> {resultadoTeste.erro_openai}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-muted-foreground">
                        {formatarTempo(resultadoTeste.timestamp)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Prompts */}
            <TabsContent value="prompts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prompts Disponíveis</CardTitle>
                  <CardDescription>
                    Escolha ou personalize o comportamento da IA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {prompts.map((prompt) => (
                    <div key={prompt.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{prompt.nome}</h4>
                          <p className="text-sm text-muted-foreground">{prompt.descricao}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {promptAtivo === prompt.id && (
                            <Badge variant="default">Ativo</Badge>
                          )}
                          <Button
                            size="sm"
                            onClick={() => aplicarPrompt(prompt.id)}
                            disabled={promptAtivo === prompt.id}
                          >
                            {promptAtivo === prompt.id ? 'Aplicado' : 'Aplicar'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{prompt.prompt}</pre>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Estatísticas */}
            <TabsContent value="estatisticas" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{estatisticas.total_mensagens_processadas || 0}</p>
                        <p className="text-sm text-muted-foreground">Mensagens Processadas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{estatisticas.agendamentos_criados_ia || 0}</p>
                        <p className="text-sm text-muted-foreground">Agendamentos Criados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">{((estatisticas.taxa_sucesso_agendamentos || 0) * 100).toFixed(0)}%</p>
                        <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold">{estatisticas.tempo_medio_resposta || 0}s</p>
                        <p className="text-sm text-muted-foreground">Tempo Médio</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Uso por Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(estatisticas.uso_por_cliente || []).map((cliente, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="font-medium">{cliente.cliente}</span>
                        <div className="flex space-x-4 text-sm text-muted-foreground">
                          <span>{cliente.mensagens} mensagens</span>
                          <span>{cliente.agendamentos} agendamentos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Logs */}
            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logs de Atividade</CardTitle>
                  <CardDescription>
                    Histórico de atividades da IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {logs.map((log) => (
                      <div key={log.id} className="border border-border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={log.sucesso ? 'default' : 'destructive'}>
                              {log.tipo}
                            </Badge>
                            <span className="text-sm font-medium">{log.cliente}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatarTempo(log.timestamp)}
                          </span>
                        </div>
                        
                        {log.mensagem_entrada && (
                          <div className="text-sm mb-1">
                            <strong>Entrada:</strong> {log.mensagem_entrada}
                          </div>
                        )}
                        
                        {log.resposta_ia && (
                          <div className="text-sm mb-1">
                            <strong>Resposta:</strong> {log.resposta_ia}
                          </div>
                        )}
                        
                        {log.erro && (
                          <div className="text-sm text-red-600">
                            <strong>Erro:</strong> {log.erro}
                          </div>
                        )}
                        
                        {log.tempo_processamento && (
                          <div className="text-xs text-muted-foreground">
                            Processado em {log.tempo_processamento}s
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

