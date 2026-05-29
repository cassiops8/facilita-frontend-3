import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  X, 
  Plus, 
  Phone, 
  Settings, 
  TestTube,
  Trash2,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function WhatsAppConfigModal({ cliente, isOpen, onClose, onSave }) {
  const [configs, setConfigs] = useState([])
  const [novaConfig, setNovaConfig] = useState({
    numero_whatsapp: '',
    nome_exibicao: '',
    token_acesso: '',
    phone_number_id: '',
    webhook_verify_token: '',
    ativo: true
  })
  const [editandoConfig, setEditandoConfig] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [testando, setTestando] = useState(null)


  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  useEffect(() => {
    if (isOpen && cliente) {
      carregarConfigs()
    }
  }, [isOpen, cliente])

  const carregarConfigs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/whatsapp-configs?cliente_id=${cliente.id}`, { headers: getAuthHeaders() })
      const data = await response.json()
      setConfigs(data)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const salvarConfig = async () => {
    setCarregando(true)
    try {
      const configParaSalvar = {
        ...novaConfig,
        cliente_id: cliente.id
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/whatsapp-configs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(configParaSalvar)
      })

      if (response.ok) {
        await carregarConfigs()
        setNovaConfig({
          numero_whatsapp: '',
          nome_exibicao: '',
          token_acesso: '',
          phone_number_id: '',
          webhook_verify_token: '',
          ativo: true
        })
        onSave && onSave()
      } else {
        const error = await response.json()
        alert(error.erro || 'Erro ao salvar configuração')
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      alert('Erro ao salvar configuração')
    } finally {
      setCarregando(false)
    }
  }

  const atualizarConfig = async (configId, dadosAtualizados) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/whatsapp-configs/${configId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(dadosAtualizados)
      })

      if (response.ok) {
        await carregarConfigs()
        setEditandoConfig(null)
      } else {
        const error = await response.json()
        alert(error.erro || 'Erro ao atualizar configuração')
      }
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      alert('Erro ao atualizar configuração')
    }
  }

  const deletarConfig = async (configId) => {
    if (!confirm('Tem certeza que deseja deletar esta configuração?')) {
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/whatsapp-configs/${configId}`, {
        method: 'DELETE'
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        await carregarConfigs()
      } else {
        alert('Erro ao deletar configuração')
      }
    } catch (error) {
      console.error('Erro ao deletar configuração:', error)
      alert('Erro ao deletar configuração')
    }
  }

  const toggleConfig = async (configId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/whatsapp-configs/${configId}/toggle`, {
        method: 'PUT'
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        await carregarConfigs()
      } else {
        alert('Erro ao alterar status da configuração')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status da configuração')
    }
  }

  const testarConfig = async (configId) => {
    const numeroTeste = prompt('Digite o número para teste (com código do país):')
    if (!numeroTeste) return

    setTestando(configId)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/whatsapp-configs/testar/${configId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          numero_teste: numeroTeste,
          mensagem_teste: 'Teste de configuração do WhatsApp - Facilita AR'
        })
      })

      const result = await response.json()
      if (result.sucesso) {
        alert('Teste realizado com sucesso!')
      } else {
        alert('Erro no teste: ' + (result.erro || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Erro ao testar configuração:', error)
      alert('Erro ao testar configuração')
    } finally {
      setTestando(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Configurações WhatsApp - {cliente?.nome}
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure os números de WhatsApp para este cliente
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Formulário para nova configuração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Nova Configuração</span>
              </CardTitle>
              <CardDescription>
                Adicione um novo número de WhatsApp para este cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero">Número WhatsApp</Label>
                  <Input
                    id="numero"
                    placeholder="+5511999999999"
                    value={novaConfig.numero_whatsapp}
                    onChange={(e) => setNovaConfig({...novaConfig, numero_whatsapp: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="nome">Nome de Exibição</Label>
                  <Input
                    id="nome"
                    placeholder="WhatsApp Principal"
                    value={novaConfig.nome_exibicao}
                    onChange={(e) => setNovaConfig({...novaConfig, nome_exibicao: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="token">Token de Acesso</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="Token da API do WhatsApp"
                    value={novaConfig.token_acesso}
                    onChange={(e) => setNovaConfig({...novaConfig, token_acesso: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone_id">Phone Number ID</Label>
                  <Input
                    id="phone_id"
                    placeholder="ID do número no WhatsApp Business"
                    value={novaConfig.phone_number_id}
                    onChange={(e) => setNovaConfig({...novaConfig, phone_number_id: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="webhook_token">Webhook Verify Token</Label>
                <Input
                  id="webhook_token"
                  placeholder="Token de verificação do webhook"
                  value={novaConfig.webhook_verify_token}
                  onChange={(e) => setNovaConfig({...novaConfig, webhook_verify_token: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={novaConfig.ativo}
                  onCheckedChange={(checked) => setNovaConfig({...novaConfig, ativo: checked})}
                />
                <Label>Ativo</Label>
              </div>

              <Button 
                onClick={salvarConfig} 
                disabled={carregando || !novaConfig.numero_whatsapp || !novaConfig.nome_exibicao}
                className="w-full"
              >
                {carregando ? 'Salvando...' : 'Adicionar Configuração'}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de configurações existentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações Existentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {configs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma configuração de WhatsApp cadastrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {configs.map((config) => (
                    <div key={config.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-foreground">{config.nome_exibicao}</h4>
                            <Badge variant={config.ativo ? 'default' : 'secondary'}>
                              {config.ativo ? (
                                <><CheckCircle className="h-3 w-3 mr-1" />Ativo</>
                              ) : (
                                <><XCircle className="h-3 w-3 mr-1" />Inativo</>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Número:</strong> {config.numero_whatsapp}
                          </p>
                          {config.phone_number_id && (
                            <p className="text-sm text-muted-foreground mb-1">
                              <strong>Phone ID:</strong> {config.phone_number_id}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            <strong>Criado em:</strong> {new Date(config.data_criacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testarConfig(config.id)}
                            disabled={testando === config.id || !config.ativo}
                          >
                            <TestTube className="h-4 w-4" />
                            {testando === config.id ? 'Testando...' : 'Testar'}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleConfig(config.id)}
                          >
                            {config.ativo ? 'Desativar' : 'Ativar'}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditandoConfig(config)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deletarConfig(config.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}

