import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import Sidebar from './Sidebar'
import CadastroColaborador from './CadastroColaborador'
import CadastroCliente from './CadastroCliente'
import MudarClienteColaborador from './MudarClienteColaborador'
import AuditoriaLogs from './AuditoriaLogs'
import { 
  Search,
  Users, 
  Settings, 
  LogOut,
  Eye,
  UserPlus,
  Shield,
  Activity,
  MessageCircle,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react'
import facilitaLogo from '../assets/facilita-logo.jpeg'

export default function AdminDashboard({ funcionaria, onLogout, onViewFuncionaria }) {
  const [funcionarias, setFuncionarias] = useState([])
  const [estatisticas, setEstatisticas] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [mostrarModalNova, setMostrarModalNova] = useState(false)
  const [novaFuncionaria, setNovaFuncionaria] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    is_admin: false
  })
  const [carregandoNova, setCarregandoNova] = useState(false)
  const [erroNova, setErroNova] = useState('')

  const handleMenuSelect = (menuId) => {
    setActiveMenu(menuId)
    
    // Ações específicas para cada menu
    switch (menuId) {
      case 'cadastrar-colaborador':
        // O componente será renderizado baseado no activeMenu
        break
      case 'cadastrar-cliente':
        // O componente será renderizado baseado no activeMenu
        break
      case 'dashboard':
        // Já está no dashboard
        break
      default:
        // Outros menus serão implementados
        console.log(`Menu selecionado: ${menuId}`)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      // Carregar todas as funcionárias
      const funcionariasResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/funcionarias`)
      const funcionariasData = await funcionariasResponse.json()
      setFuncionarias(funcionariasData)

      // Carregar estatísticas gerais
      const estatisticasData = await carregarEstatisticas(funcionariasData)
      setEstatisticas(estatisticasData)

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setCarregando(false)
    }
  }

  const carregarEstatisticas = async (funcionariasData) => {
    try {
      let totalClientes = 0
      let totalAgendamentos = 0
      let totalConversas = 0

      for (const func of funcionariasData) {
        if (!func.is_admin) {
          // Carregar clientes da funcionária
          const clientesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/clientes?funcionaria_id=${func.id}`)
          const clientesData = await clientesResponse.json()
          totalClientes += clientesData.length

          // Carregar agendamentos da funcionária
          const agendamentosResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/agendamentos?funcionaria_id=${func.id}`)
          const agendamentosData = await agendamentosResponse.json()
          totalAgendamentos += agendamentosData.length

          // Carregar conversas da funcionária
          const conversasResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/conversas?funcionaria_id=${func.id}`)
          const conversasData = await conversasResponse.json()
          totalConversas += conversasData.length
        }
      }

      return {
        totalFuncionarias: funcionariasData.filter(f => !f.is_admin).length,
        totalClientes,
        totalAgendamentos,
        totalConversas
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      return {}
    }
  }

  const visualizarFuncionaria = (funcionariaId) => {
    onViewFuncionaria(funcionariaId)
  }

  const criarNovaFuncionaria = async (e) => {
    e.preventDefault()
    setCarregandoNova(true)
    setErroNova('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/funcionarias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaFuncionaria),
      })

      const data = await response.json()

      if (response.ok) {
        // Recarregar dados
        await carregarDados()
        
        // Limpar formulário e fechar modal
        setNovaFuncionaria({
          nome: '',
          email: '',
          senha: '',
          telefone: '',
          is_admin: false
        })
        setMostrarModalNova(false)
      } else {
        setErroNova(data.erro || 'Erro ao criar funcionária')
      }
    } catch (error) {
      setErroNova('Erro de conexão. Tente novamente.')
    } finally {
      setCarregandoNova(false)
    }
  }

  const alternarPermissaoAdmin = async (funcionariaId, isAdmin) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/funcionarias/${funcionariaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_admin: !isAdmin }),
      })

      if (response.ok) {
        await carregarDados()
      }
    } catch (error) {
      console.error('Erro ao alterar permissão:', error)
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar onMenuSelect={handleMenuSelect} activeMenu={activeMenu} />
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-primary/20 border-b border-border">
          <div className="flex justify-between items-center h-16 px-6">
            <div className="flex items-center space-x-4">
              <img 
                src={facilitaLogo} 
                alt="Facilita AR" 
                className="h-8 w-auto object-contain"
              />
              <div>
                <span className="text-lg font-medium text-foreground">Painel Administrativo</span>
                <p className="text-sm text-muted-foreground">Gestão de funcionárias e operações</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Pesquisar funcionárias" 
                  className="pl-10 w-64 bg-primary/10 border-primary/20"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
          {/* Renderização condicional baseada no menu ativo */}
          {activeMenu === 'dashboard' && (
            <>
              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funcionárias Ativas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalFuncionarias || 0}</div>
              <p className="text-xs text-muted-foreground">
                Funcionárias trabalhando
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalClientes || 0}</div>
              <p className="text-xs text-muted-foreground">
                Clientes atendidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalAgendamentos || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total de agendamentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalConversas || 0}</div>
              <p className="text-xs text-muted-foreground">
                Conversas no WhatsApp
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Funcionárias */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Funcionárias</span>
                </CardTitle>
                <CardDescription>
                  Gerencie todas as funcionárias e seus acessos
                </CardDescription>
              </div>
              <Button onClick={() => setMostrarModalNova(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Nova Funcionária
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funcionarias.map((func) => (
                <div key={func.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {func.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{func.nome}</h4>
                      <p className="text-sm text-muted-foreground">{func.email}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{func.total_clientes || 0} clientes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {func.ativa ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={func.ativa ? 'default' : 'secondary'}>
                      {func.ativa ? 'Ativa' : 'Inativa'}
                    </Badge>
                    {func.is_admin && (
                      <Badge variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    
                    {/* Botão para alterar permissão de admin */}
                    {func.id !== funcionaria.id && (
                      <Button 
                        size="sm" 
                        variant={func.is_admin ? "destructive" : "default"}
                        onClick={() => alternarPermissaoAdmin(func.id, func.is_admin)}
                      >
                        {func.is_admin ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Remover Admin
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Tornar Admin
                          </>
                        )}
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => visualizarFuncionaria(func.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                  </div>
                </div>
              ))}
              
              {funcionarias.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma funcionária cadastrada ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
            </>
          )}

          {/* Cadastro de Colaborador */}
          {activeMenu === 'cadastrar-colaborador' && (
            <CadastroColaborador
              onSuccess={() => {
                setActiveMenu('dashboard')
                carregarDados()
              }}
              onCancel={() => setActiveMenu('dashboard')}
            />
          )}

          {/* Cadastro de Cliente */}
          {activeMenu === 'cadastrar-cliente' && (
            <CadastroCliente
              onSuccess={() => {
                setActiveMenu('dashboard')
                carregarDados()
              }}
              onCancel={() => setActiveMenu('dashboard')}
            />
          )}

          {/* Mudar Cliente de Colaborador */}
          {activeMenu === 'mudar-cliente' && (
            <MudarClienteColaborador
              onSuccess={() => {
                setActiveMenu('dashboard')
                carregarDados()
              }}
              onCancel={() => setActiveMenu('dashboard')}
            />
          )}

          {/* Auditoria/Logs */}
          {activeMenu === 'auditoria' && (
            <AuditoriaLogs
              onCancel={() => setActiveMenu('dashboard')}
            />
          )}

          {/* Outros menus */}
          {!['dashboard', 'cadastrar-colaborador', 'cadastrar-cliente', 'mudar-cliente', 'auditoria'].includes(activeMenu) && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Funcionalidade em Desenvolvimento</h2>
              <p className="text-muted-foreground mb-6">
                A funcionalidade "{activeMenu}" está sendo desenvolvida e estará disponível em breve.
              </p>
              <Button onClick={() => setActiveMenu('dashboard')}>
                Voltar ao Dashboard
              </Button>
            </div>
          )}

      {/* Modal de Nova Funcionária */}
      {mostrarModalNova && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Nova Funcionária</CardTitle>
              <CardDescription>
                Adicione uma nova funcionária ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={criarNovaFuncionaria} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Nome da funcionária"
                    value={novaFuncionaria.nome}
                    onChange={(e) => setNovaFuncionaria({...novaFuncionaria, nome: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={novaFuncionaria.email}
                    onChange={(e) => setNovaFuncionaria({...novaFuncionaria, email: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="Senha de acesso"
                    value={novaFuncionaria.senha}
                    onChange={(e) => setNovaFuncionaria({...novaFuncionaria, senha: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={novaFuncionaria.telefone}
                    onChange={(e) => setNovaFuncionaria({...novaFuncionaria, telefone: e.target.value})}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_admin"
                    checked={novaFuncionaria.is_admin}
                    onCheckedChange={(checked) => setNovaFuncionaria({...novaFuncionaria, is_admin: checked})}
                  />
                  <Label htmlFor="is_admin" className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Conceder permissões de administrador</span>
                  </Label>
                </div>

                {erroNova && (
                  <Alert variant="destructive">
                    <AlertDescription>{erroNova}</AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={carregandoNova}
                  >
                    {carregandoNova ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Criando...</span>
                      </div>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Criar Funcionária
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMostrarModalNova(false)
                      setNovaFuncionaria({
                        nome: '',
                        email: '',
                        senha: '',
                        telefone: '',
                        is_admin: false
                      })
                      setErroNova('')
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
      </div>
    </div>
  )
}

