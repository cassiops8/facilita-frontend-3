import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ArrowRightLeft, 
  Search, 
  Users, 
  Building2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { apiGet, apiPost } from '../utils/api'

export default function MudarClienteColaborador({ onSuccess, onCancel }) {
  const [clientes, setClientes] = useState([])
  const [funcionarias, setFuncionarias] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [novaFuncionaria, setNovaFuncionaria] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      // Carregar clientes
      const clientesResponse = await apiGet('/clientes')
      if (clientesResponse?.ok) {
        const clientesData = await clientesResponse.json()
        setClientes(clientesData)
      }

      // Carregar funcionárias
      const funcionariasResponse = await apiGet('/funcionarias')
      if (funcionariasResponse?.ok) {
        const funcionariasData = await funcionariasResponse.json()
        setFuncionarias(funcionariasData.filter(f => f.ativa))
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setErro('Erro ao carregar dados do sistema')
    }
  }

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(filtroCliente.toLowerCase()) ||
    cliente.tipo_profissional.toLowerCase().includes(filtroCliente.toLowerCase())
  )

  const handleMudarCliente = async () => {
    if (!clienteSelecionado || !novaFuncionaria) {
      setErro('Selecione um cliente e uma funcionária')
      return
    }

    setCarregando(true)
    setErro('')
    setSucesso('')

    try {
      const response = await apiPost(`/clientes/${clienteSelecionado.id}/transferir`, {
        funcionaria_id: parseInt(novaFuncionaria)
      })

      if (response?.ok) {
        setSucesso(`Cliente "${clienteSelecionado.nome}" transferido com sucesso!`)
        
        // Atualizar a lista de clientes
        await carregarDados()
        
        // Limpar seleções
        setClienteSelecionado(null)
        setNovaFuncionaria('')
        
        setTimeout(() => {
          setSucesso('')
        }, 3000)
      } else {
        const errorData = await response.json()
        setErro(errorData.error || 'Erro ao transferir cliente')
      }
    } catch (error) {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const getFuncionariaNome = (funcionariaId) => {
    const funcionaria = funcionarias.find(f => f.id === funcionariaId)
    return funcionaria ? funcionaria.nome : 'Funcionária não encontrada'
  }

  const getNovaFuncionariaNome = () => {
    const funcionaria = funcionarias.find(f => f.id.toString() === novaFuncionaria)
    return funcionaria ? funcionaria.nome : ''
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRightLeft className="h-5 w-5" />
            <span>Mudar Cliente de Colaborador</span>
          </CardTitle>
          <CardDescription>
            Transfira clientes entre funcionárias para melhor distribuição de trabalho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtro de Clientes */}
          <div className="space-y-2">
            <Label>Buscar Cliente</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                placeholder="Digite o nome do cliente ou tipo profissional"
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Clientes */}
          <div className="space-y-2">
            <Label>Selecionar Cliente</Label>
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {clientesFiltrados.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum cliente encontrado</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {clientesFiltrados.map((cliente) => (
                    <div
                      key={cliente.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        clienteSelecionado?.id === cliente.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setClienteSelecionado(cliente)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {cliente.nome.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{cliente.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {cliente.tipo_profissional}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {getFuncionariaNome(cliente.funcionaria_id)}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Funcionária atual
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Seleção da Nova Funcionária */}
          {clienteSelecionado && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                <span className="font-medium">Transferir Cliente</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">De:</p>
                  <Badge variant="outline">
                    {getFuncionariaNome(clienteSelecionado.funcionaria_id)}
                  </Badge>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRightLeft className="h-6 w-6 text-primary" />
                </div>
                
                <div>
                  <Label>Para:</Label>
                  <Select
                    value={novaFuncionaria}
                    onValueChange={setNovaFuncionaria}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a funcionária" />
                    </SelectTrigger>
                    <SelectContent>
                      {funcionarias
                        .filter(f => f.id !== clienteSelecionado.funcionaria_id)
                        .map((funcionaria) => (
                          <SelectItem key={funcionaria.id} value={funcionaria.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>{funcionaria.nome}</span>
                              {funcionaria.is_admin && (
                                <Badge variant="secondary" className="text-xs">Admin</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resumo da Transferência */}
              {novaFuncionaria && (
                <div className="p-3 bg-background rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-sm">Confirmar Transferência</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    O cliente <strong>{clienteSelecionado.nome}</strong> será transferido de{' '}
                    <strong>{getFuncionariaNome(clienteSelecionado.funcionaria_id)}</strong> para{' '}
                    <strong>{getNovaFuncionariaNome()}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mensagens */}
          {erro && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          {sucesso && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-600">{sucesso}</AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex space-x-2">
            <Button
              onClick={handleMudarCliente}
              disabled={!clienteSelecionado || !novaFuncionaria || carregando}
              className="flex-1"
            >
              {carregando ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Transferindo...</span>
                </div>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Confirmar Transferência
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total de Clientes</p>
                <p className="text-2xl font-bold">{clientes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Funcionárias Ativas</p>
                <p className="text-2xl font-bold">{funcionarias.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Média por Funcionária</p>
                <p className="text-2xl font-bold">
                  {funcionarias.length > 0 ? Math.round(clientes.length / funcionarias.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
