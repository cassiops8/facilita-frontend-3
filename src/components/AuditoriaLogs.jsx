import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
  User,
  Activity,
  Database,
  ChevronLeft,
  ChevronRight,
  Eye,
  BarChart3
} from 'lucide-react'

export default function AuditoriaLogs({ onCancel }) {
  const [logs, setLogs] = useState([])
  const [resumo, setResumo] = useState({})
  const [filtros, setFiltros] = useState({
    usuario_id: '',
    acao: '',
    tabela: '',
    data_inicio: '',
    data_fim: ''
  })
  const [funcionarias, setFuncionarias] = useState([])
  const [paginacao, setPaginacao] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0
  })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [logSelecionado, setLogSelecionado] = useState(null)


  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const acoes = ['CREATE', 'UPDATE', 'DELETE']
  const tabelas = [
    'funcionarias',
    'clientes', 
    'agendamentos',
    'conversas',
    'categorias_colaborador',
    'tipos_cliente'
  ]

  useEffect(() => {
    carregarDados()
    carregarResumo()
    carregarFuncionarias()
  }, [])

  useEffect(() => {
    carregarLogs()
  }, [filtros, paginacao.page])

  const carregarDados = async () => {
    await Promise.all([
      carregarLogs(),
      carregarResumo(),
      carregarFuncionarias()
    ])
  }

  const carregarLogs = async () => {
    setCarregando(true)
    try {
      const params = new URLSearchParams({
        page: paginacao.page.toString(),
        per_page: paginacao.per_page.toString(),
        ...Object.fromEntries(
          Object.entries(filtros).filter(([_, value]) => value !== '')
        )
      })

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/logs-auditoria?${params}`, { headers: getAuthHeaders() })
      const data = await response.json()
      
      setLogs(data.logs || [])
      setPaginacao(prev => ({
        ...prev,
        total: data.total || 0,
        pages: data.pages || 0
      }))
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      setErro('Erro ao carregar logs de auditoria')
    } finally {
      setCarregando(false)
    }
  }

  const carregarResumo = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/logs-auditoria/resumo`, { headers: getAuthHeaders() })
      const data = await response.json()
      setResumo(data && typeof data === 'object' ? data : {})
    } catch (error) {
      console.error('Erro ao carregar resumo:', error)
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

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
    setPaginacao(prev => ({ ...prev, page: 1 }))
  }

  const limparFiltros = () => {
    setFiltros({
      usuario_id: '',
      acao: '',
      tabela: '',
      data_inicio: '',
      data_fim: ''
    })
    setPaginacao(prev => ({ ...prev, page: 1 }))
  }

  const formatarData = (dataString) => {
    const data = new Date(dataString)
    return data.toLocaleString('pt-BR')
  }

  const getAcaoBadge = (acao) => {
    const cores = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800'
    }
    return cores[acao] || 'bg-gray-100 text-gray-800'
  }

  const getTabelaNome = (tabela) => {
    const nomes = {
      funcionarias: 'Funcionárias',
      clientes: 'Clientes',
      agendamentos: 'Agendamentos',
      conversas: 'Conversas',
      categorias_colaborador: 'Categorias',
      tipos_cliente: 'Tipos de Cliente'
    }
    return nomes[tabela] || tabela
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Ações (24h)</p>
                <p className="text-2xl font-bold">{resumo.total_acoes_24h || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Criações</p>
                <p className="text-2xl font-bold">{resumo.acoes_por_tipo?.CREATE || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Atualizações</p>
                <p className="text-2xl font-bold">{resumo.acoes_por_tipo?.UPDATE || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Exclusões</p>
                <p className="text-2xl font-bold">{resumo.acoes_por_tipo?.DELETE || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros de Auditoria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Funcionária</Label>
              <Select
                value={filtros.usuario_id}
                onValueChange={(value) => handleFiltroChange('usuario_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {funcionarias.map((func) => (
                    <SelectItem key={func.id} value={func.id.toString()}>
                      {func.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ação</Label>
              <Select
                value={filtros.acao}
                onValueChange={(value) => handleFiltroChange('acao', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {acoes.map((acao) => (
                    <SelectItem key={acao} value={acao}>
                      {acao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tabela</Label>
              <Select
                value={filtros.tabela}
                onValueChange={(value) => handleFiltroChange('tabela', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {tabelas.map((tabela) => (
                    <SelectItem key={tabela} value={tabela}>
                      {getTabelaNome(tabela)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="datetime-local"
                value={filtros.data_inicio}
                onChange={(e) => handleFiltroChange('data_inicio', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="datetime-local"
                value={filtros.data_fim}
                onChange={(e) => handleFiltroChange('data_fim', e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <Button onClick={carregarLogs} disabled={carregando}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Logs de Auditoria</span>
          </CardTitle>
          <CardDescription>
            Registro detalhado de todas as ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {erro && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          {carregando ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum log encontrado</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={getAcaoBadge(log.acao)}>
                            {log.acao}
                          </Badge>
                          <div>
                            <p className="font-medium">
                              {getTabelaNome(log.tabela)} #{log.registro_id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              por {log.usuario_nome} • {formatarData(log.data_hora)}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setLogSelecionado(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Paginação */}
              {paginacao.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Página {paginacao.page} de {paginacao.pages} ({paginacao.total} registros)
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={paginacao.page <= 1}
                      onClick={() => setPaginacao(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={paginacao.page >= paginacao.pages}
                      onClick={() => setPaginacao(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Log */}
      {logSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Detalhes do Log #{logSelecionado.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ação</Label>
                  <Badge className={getAcaoBadge(logSelecionado.acao)}>
                    {logSelecionado.acao}
                  </Badge>
                </div>
                <div>
                  <Label>Tabela</Label>
                  <p>{getTabelaNome(logSelecionado.tabela)}</p>
                </div>
                <div>
                  <Label>Usuário</Label>
                  <p>{logSelecionado.usuario_nome}</p>
                </div>
                <div>
                  <Label>Data/Hora</Label>
                  <p>{formatarData(logSelecionado.data_hora)}</p>
                </div>
              </div>

              {logSelecionado.dados_anteriores && (
                <div>
                  <Label>Dados Anteriores</Label>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(JSON.parse(logSelecionado.dados_anteriores), null, 2)}
                  </pre>
                </div>
              )}

              {logSelecionado.dados_novos && (
                <div>
                  <Label>Dados Novos</Label>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(JSON.parse(logSelecionado.dados_novos), null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setLogSelecionado(null)}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botão Voltar */}
      {onCancel && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onCancel}>
            Voltar ao Dashboard
          </Button>
        </div>
      )}
    </div>
  )
}

