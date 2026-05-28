import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  X, 
  Save, 
  Upload, 
  Palette, 
  Settings, 
  Globe,
  Plus,
  Edit,
  Trash2,
  Download,
  FileUp,
  Eye,
  EyeOff
} from 'lucide-react'

export default function ConfiguracaoSistema({ isOpen, onClose, onSave }) {
  const [aparencia, setAparencia] = useState({
    nome_sistema: 'Facilita AR',
    cor_primaria: '#8B4513',
    cor_secundaria: '#D4C1A5',
    cor_fundo: '#FFFFFF',
    cor_texto: '#000000',
    cor_accent: '#8B4513',
    tema_escuro: false,
    logo_url: '/static/logo-facilita.png'
  })
  
  const [instancias, setInstancias] = useState([])
  const [novaInstancia, setNovaInstancia] = useState({
    nome: '',
    subdominio: '',
    logo_url: '',
    cores_personalizadas: {},
    ativa: true
  })
  
  const [carregando, setCarregando] = useState(false)
  const [mostrarNovaInstancia, setMostrarNovaInstancia] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [previewLogo, setPreviewLogo] = useState(null)

  useEffect(() => {
    if (isOpen) {
      carregarConfiguracoes()
      carregarInstancias()
    }
  }, [isOpen])

  const carregarConfiguracoes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/configuracoes/aparencia`)
      const data = await response.json()
      setAparencia(data)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const carregarInstancias = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/whitelabel/instancias`)
      const data = await response.json()
      setInstancias(data)
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error)
    }
  }

  const salvarAparencia = async () => {
    setCarregando(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/configuracoes/aparencia`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aparencia)
      })

      if (response.ok) {
        alert('Configurações de aparência salvas com sucesso!')
        onSave && onSave()
      } else {
        alert('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar aparência:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setCarregando(false)
    }
  }

  const uploadLogo = async () => {
    if (!logoFile) return

    const formData = new FormData()
    formData.append('logo', logoFile)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/configuracoes/upload-logo`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.sucesso) {
        setAparencia({...aparencia, logo_url: result.url_logo})
        setPreviewLogo(null)
        setLogoFile(null)
        alert('Logo enviada com sucesso!')
      } else {
        alert(result.erro || 'Erro ao enviar logo')
      }
    } catch (error) {
      console.error('Erro ao enviar logo:', error)
      alert('Erro ao enviar logo')
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreviewLogo(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const criarInstancia = async () => {
    if (!novaInstancia.nome || !novaInstancia.subdominio) {
      alert('Nome e subdomínio são obrigatórios')
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/whitelabel/instancias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...novaInstancia,
          cores_personalizadas: aparencia // Usar cores atuais como base
        })
      })

      if (response.ok) {
        setMostrarNovaInstancia(false)
        setNovaInstancia({
          nome: '',
          subdominio: '',
          logo_url: '',
          cores_personalizadas: {},
          ativa: true
        })
        carregarInstancias()
        alert('Instância criada com sucesso!')
      } else {
        const error = await response.json()
        alert(error.erro || 'Erro ao criar instância')
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error)
      alert('Erro ao criar instância')
    }
  }

  const toggleInstancia = async (instanciaId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/whitelabel/instancias/${instanciaId}/toggle`, {
        method: 'PUT'
      })

      if (response.ok) {
        carregarInstancias()
      } else {
        alert('Erro ao alterar status da instância')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status da instância')
    }
  }

  const deletarInstancia = async (instanciaId) => {
    if (!confirm('Tem certeza que deseja deletar esta instância?')) {
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/whitelabel/instancias/${instanciaId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        carregarInstancias()
        alert('Instância deletada com sucesso!')
      } else {
        alert('Erro ao deletar instância')
      }
    } catch (error) {
      console.error('Erro ao deletar instância:', error)
      alert('Erro ao deletar instância')
    }
  }

  const exportarConfiguracoes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/configuracoes/exportar`)
      const data = await response.json()
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facilita-ar-config-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar configurações:', error)
      alert('Erro ao exportar configurações')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Configurações do Sistema
            </h2>
            <p className="text-sm text-muted-foreground">
              Personalize aparência, cores, logo e configure instâncias whitelabel
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="aparencia" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="aparencia" className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Aparência</span>
              </TabsTrigger>
              <TabsTrigger value="whitelabel" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Whitelabel</span>
              </TabsTrigger>
              <TabsTrigger value="sistema" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Sistema</span>
              </TabsTrigger>
            </TabsList>

            {/* Aba Aparência */}
            <TabsContent value="aparencia" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logo e Identidade</CardTitle>
                  <CardDescription>
                    Configure a logo e nome do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nome_sistema">Nome do Sistema</Label>
                    <Input
                      id="nome_sistema"
                      value={aparencia.nome_sistema}
                      onChange={(e) => setAparencia({...aparencia, nome_sistema: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Logo Atual</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <img 
                        src={aparencia.logo_url} 
                        alt="Logo atual" 
                        className="h-16 w-auto border border-border rounded"
                        onError={(e) => {
                          e.target.src = '/static/logo-facilita.png'
                        }}
                      />
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="mb-2"
                        />
                        {previewLogo && (
                          <div className="flex items-center space-x-2">
                            <img 
                              src={previewLogo} 
                              alt="Preview" 
                              className="h-12 w-auto border border-border rounded"
                            />
                            <Button size="sm" onClick={uploadLogo}>
                              <Upload className="h-4 w-4 mr-2" />
                              Enviar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Paleta de Cores</CardTitle>
                  <CardDescription>
                    Personalize as cores do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cor_primaria">Cor Primária</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="cor_primaria"
                          type="color"
                          value={aparencia.cor_primaria}
                          onChange={(e) => setAparencia({...aparencia, cor_primaria: e.target.value})}
                          className="w-16 h-10"
                        />
                        <Input
                          value={aparencia.cor_primaria}
                          onChange={(e) => setAparencia({...aparencia, cor_primaria: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cor_secundaria">Cor Secundária</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="cor_secundaria"
                          type="color"
                          value={aparencia.cor_secundaria}
                          onChange={(e) => setAparencia({...aparencia, cor_secundaria: e.target.value})}
                          className="w-16 h-10"
                        />
                        <Input
                          value={aparencia.cor_secundaria}
                          onChange={(e) => setAparencia({...aparencia, cor_secundaria: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cor_accent">Cor de Destaque</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="cor_accent"
                          type="color"
                          value={aparencia.cor_accent}
                          onChange={(e) => setAparencia({...aparencia, cor_accent: e.target.value})}
                          className="w-16 h-10"
                        />
                        <Input
                          value={aparencia.cor_accent}
                          onChange={(e) => setAparencia({...aparencia, cor_accent: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cor_fundo">Cor de Fundo</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="cor_fundo"
                          type="color"
                          value={aparencia.cor_fundo}
                          onChange={(e) => setAparencia({...aparencia, cor_fundo: e.target.value})}
                          className="w-16 h-10"
                        />
                        <Input
                          value={aparencia.cor_fundo}
                          onChange={(e) => setAparencia({...aparencia, cor_fundo: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cor_texto">Cor do Texto</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="cor_texto"
                          type="color"
                          value={aparencia.cor_texto}
                          onChange={(e) => setAparencia({...aparencia, cor_texto: e.target.value})}
                          className="w-16 h-10"
                        />
                        <Input
                          value={aparencia.cor_texto}
                          onChange={(e) => setAparencia({...aparencia, cor_texto: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={aparencia.tema_escuro}
                      onCheckedChange={(checked) => setAparencia({...aparencia, tema_escuro: checked})}
                    />
                    <Label>Tema Escuro</Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={salvarAparencia} disabled={carregando}>
                  <Save className="h-4 w-4 mr-2" />
                  {carregando ? 'Salvando...' : 'Salvar Aparência'}
                </Button>
              </div>
            </TabsContent>

            {/* Aba Whitelabel */}
            <TabsContent value="whitelabel" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Instâncias Whitelabel</span>
                    <Button onClick={() => setMostrarNovaInstancia(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Instância
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Crie instâncias personalizadas do sistema para revenda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {instancias.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma instância whitelabel criada</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {instancias.map((instancia) => (
                        <div key={instancia.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-foreground">{instancia.nome}</h4>
                                <Badge variant={instancia.ativa ? 'default' : 'secondary'}>
                                  {instancia.ativa ? (
                                    <><Eye className="h-3 w-3 mr-1" />Ativa</>
                                  ) : (
                                    <><EyeOff className="h-3 w-3 mr-1" />Inativa</>
                                  )}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                <strong>Subdomínio:</strong> {instancia.subdominio}
                              </p>
                              <p className="text-sm text-muted-foreground mb-1">
                                <strong>URL:</strong> {instancia.url_completa}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Criada em:</strong> {new Date(instancia.data_criacao).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleInstancia(instancia.id)}
                              >
                                {instancia.ativa ? 'Desativar' : 'Ativar'}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deletarInstancia(instancia.id)}
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
            </TabsContent>

            {/* Aba Sistema */}
            <TabsContent value="sistema" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Backup e Restauração</CardTitle>
                  <CardDescription>
                    Exporte ou importe configurações do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button onClick={exportarConfiguracoes}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Configurações
                    </Button>
                    
                    <Button variant="outline">
                      <FileUp className="h-4 w-4 mr-2" />
                      Importar Configurações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Nova Instância */}
        {mostrarNovaInstancia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Nova Instância Whitelabel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome_instancia">Nome da Instância</Label>
                  <Input
                    id="nome_instancia"
                    placeholder="Ex: Clínica Exemplo"
                    value={novaInstancia.nome}
                    onChange={(e) => setNovaInstancia({...novaInstancia, nome: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="subdominio">Subdomínio</Label>
                  <Input
                    id="subdominio"
                    placeholder="clinica-exemplo"
                    value={novaInstancia.subdominio}
                    onChange={(e) => setNovaInstancia({...novaInstancia, subdominio: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL final: https://{novaInstancia.subdominio || 'subdominio'}.facilita-ar.com
                  </p>
                </div>
                <div>
                  <Label htmlFor="logo_instancia">URL da Logo (opcional)</Label>
                  <Input
                    id="logo_instancia"
                    placeholder="https://exemplo.com/logo.png"
                    value={novaInstancia.logo_url}
                    onChange={(e) => setNovaInstancia({...novaInstancia, logo_url: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={novaInstancia.ativa}
                    onCheckedChange={(checked) => setNovaInstancia({...novaInstancia, ativa: checked})}
                  />
                  <Label>Ativa</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setMostrarNovaInstancia(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={criarInstancia} disabled={!novaInstancia.nome || !novaInstancia.subdominio}>
                    Criar Instância
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

