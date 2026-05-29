import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Building2, Plus, MessageSquare, Bot, Upload, FileText, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function CadastroCliente({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    tipo_profissional: '',
    tipo_cliente_id: '',
    setor: '',
    endereco: '',
    observacoes: '',
    funcionaria_id: '',
    // Configurações WhatsApp
    whatsapp_ativo: false,
    whatsapp_numero: '',
    whatsapp_token: '',
    whatsapp_webhook: '',
    mensagem_boas_vindas: '',
    mensagem_ausencia: '',
    horario_inicio: '09:00',
    horario_fim: '18:00',
    // Configurações IA
    ia_ativa: false,
    ia_modelo: 'gpt-3.5-turbo',
    ia_personalidade: 'profissional',
    ia_tom: 'formal',
    ia_conhecimento_base: '',
    ia_instrucoes_especiais: '',
    ia_faq: '',
    ia_servicos: '',
    ia_precos: ''
  })
  const [funcionarias, setFuncionarias] = useState([])
  const [tiposCliente, setTiposCliente] = useState([])
  const [novoTipo, setNovoTipo] = useState('')
  const [novoSetor, setNovoSetor] = useState('')
  const [mostrarNovoTipo, setMostrarNovoTipo] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const tiposProfissionais = [
    'Médico',
    'Esteticista',
    'Massoterapeuta',
    'Tricologista',
    'Fisioterapeuta',
    'Nutricionista',
    'Psicólogo',
    'Dentista',
    'Outro'
  ]

  const setoresComuns = [
    'Saúde',
    'Beleza',
    'Estética',
    'Bem-estar',
    'Medicina',
    'Terapias',
    'Outro'
  ]


  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      // Carregar funcionárias
      const funcionariasResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/funcionarias`, { headers: getAuthHeaders() })
      const funcionariasData = await funcionariasResponse.json()
      setFuncionarias(funcionariasData)

      // Carregar tipos de cliente
      const tiposResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tipos-cliente`, { headers: getAuthHeaders() })
      const tiposData = await tiposResponse.json()
      setTiposCliente(tiposData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const criarTipoCliente = async () => {
    if (!novoTipo.trim()) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tipos-cliente`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nome: novoTipo,
          setor: novoSetor || 'Geral',
          descricao: `Tipo de cliente: ${novoTipo}`
        })
      })

      if (response.ok) {
        const tipo = await response.json()
        setTiposCliente([...tiposCliente, tipo])
        setFormData({ ...formData, tipo_cliente_id: tipo.id })
        setNovoTipo('')
        setNovoSetor('')
        setMostrarNovoTipo(false)
      }
    } catch (error) {
      console.error('Erro ao criar tipo de cliente:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    setSucesso('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/clientes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSucesso('Cliente cadastrado com sucesso!')
        setTimeout(() => {
          onSuccess && onSuccess()
        }, 1500)
      } else {
        const errorData = await response.json()
        setErro(errorData.error || 'Erro ao cadastrar cliente')
      }
    } catch (error) {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Cadastrar Novo Cliente</span>
        </CardTitle>
        <CardDescription>
          Adicione um novo cliente ao sistema e atribua a uma funcionária
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome/Empresa *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Nome do cliente ou empresa"
                required
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            {/* Tipo Profissional */}
            <div className="space-y-2">
              <Label>Tipo Profissional *</Label>
              <Select
                value={formData.tipo_profissional}
                onValueChange={(value) => handleInputChange('tipo_profissional', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposProfissionais.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Cliente */}
            <div className="space-y-2">
              <Label>Tipo de Cliente</Label>
              <div className="flex space-x-2">
                <Select
                  value={formData.tipo_cliente_id}
                  onValueChange={(value) => handleInputChange('tipo_cliente_id', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCliente.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nome} - {tipo.setor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarNovoTipo(!mostrarNovoTipo)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Novo Tipo de Cliente */}
              {mostrarNovoTipo && (
                <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
                  <div className="flex space-x-2">
                    <Input
                      value={novoTipo}
                      onChange={(e) => setNovoTipo(e.target.value)}
                      placeholder="Nome do novo tipo"
                      className="flex-1"
                    />
                    <Select
                      value={novoSetor}
                      onValueChange={setNovoSetor}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {setoresComuns.map((setor) => (
                          <SelectItem key={setor} value={setor}>
                            {setor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={criarTipoCliente}
                    disabled={!novoTipo.trim()}
                    className="w-full"
                  >
                    Criar Tipo de Cliente
                  </Button>
                </div>
              )}
            </div>

            {/* Setor */}
            <div className="space-y-2">
              <Label>Setor</Label>
              <Select
                value={formData.setor}
                onValueChange={(value) => handleInputChange('setor', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setoresComuns.map((setor) => (
                    <SelectItem key={setor} value={setor}>
                      {setor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Funcionária Responsável */}
            <div className="space-y-2 md:col-span-2">
              <Label>Funcionária Responsável *</Label>
              <Select
                value={formData.funcionaria_id}
                onValueChange={(value) => handleInputChange('funcionaria_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a funcionária" />
                </SelectTrigger>
                <SelectContent>
                  {funcionarias.map((funcionaria) => (
                    <SelectItem key={funcionaria.id} value={funcionaria.id.toString()}>
                      {funcionaria.nome} - {funcionaria.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              placeholder="Endereço completo do cliente"
              rows={2}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Informações adicionais sobre o cliente"
              rows={2}
            />
          </div>

          <Separator className="my-6" />

          {/* Configurações Avançadas */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Configurações de WhatsApp e IA</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure o WhatsApp e treine a IA personalizada para este cliente
            </p>

            <Tabs defaultValue="whatsapp" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp</span>
                </TabsTrigger>
                <TabsTrigger value="ia" className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span>IA Personalizada</span>
                </TabsTrigger>
              </TabsList>

              {/* Configurações WhatsApp */}
              <TabsContent value="whatsapp" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Configuração do WhatsApp</CardTitle>
                    <CardDescription>
                      Configure a integração com WhatsApp para este cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Ativar WhatsApp */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Ativar WhatsApp</Label>
                        <p className="text-sm text-muted-foreground">
                          Habilitar integração com WhatsApp para este cliente
                        </p>
                      </div>
                      <Switch
                        checked={formData.whatsapp_ativo}
                        onCheckedChange={(checked) => handleInputChange('whatsapp_ativo', checked)}
                      />
                    </div>

                    {formData.whatsapp_ativo && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Número do WhatsApp</Label>
                            <Input
                              value={formData.whatsapp_numero}
                              onChange={(e) => handleInputChange('whatsapp_numero', e.target.value)}
                              placeholder="+55 11 99999-9999"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Token de Acesso</Label>
                            <Input
                              value={formData.whatsapp_token}
                              onChange={(e) => handleInputChange('whatsapp_token', e.target.value)}
                              placeholder="Token da API do WhatsApp"
                              type="password"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input
                            value={formData.whatsapp_webhook}
                            onChange={(e) => handleInputChange('whatsapp_webhook', e.target.value)}
                            placeholder="https://api.exemplo.com/webhook"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Mensagem de Boas-vindas</Label>
                          <Textarea
                            value={formData.mensagem_boas_vindas}
                            onChange={(e) => handleInputChange('mensagem_boas_vindas', e.target.value)}
                            placeholder="Olá! Bem-vindo(a) à nossa clínica. Como posso ajudá-lo(a) hoje?"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Mensagem de Ausência</Label>
                          <Textarea
                            value={formData.mensagem_ausencia}
                            onChange={(e) => handleInputChange('mensagem_ausencia', e.target.value)}
                            placeholder="No momento estamos fora do horário de atendimento. Retornaremos em breve!"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Horário de Início</Label>
                            <Input
                              type="time"
                              value={formData.horario_inicio}
                              onChange={(e) => handleInputChange('horario_inicio', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Horário de Fim</Label>
                            <Input
                              type="time"
                              value={formData.horario_fim}
                              onChange={(e) => handleInputChange('horario_fim', e.target.value)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Configurações IA */}
              <TabsContent value="ia" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">IA Personalizada</CardTitle>
                    <CardDescription>
                      Treine e configure a IA específica para este cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Ativar IA */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Ativar IA</Label>
                        <p className="text-sm text-muted-foreground">
                          Habilitar assistente de IA personalizado para este cliente
                        </p>
                      </div>
                      <Switch
                        checked={formData.ia_ativa}
                        onCheckedChange={(checked) => handleInputChange('ia_ativa', checked)}
                      />
                    </div>

                    {formData.ia_ativa && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Modelo de IA</Label>
                            <Select
                              value={formData.ia_modelo}
                              onValueChange={(value) => handleInputChange('ia_modelo', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Rápido)</SelectItem>
                                <SelectItem value="gpt-4">GPT-4 (Avançado)</SelectItem>
                                <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Premium)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Personalidade</Label>
                            <Select
                              value={formData.ia_personalidade}
                              onValueChange={(value) => handleInputChange('ia_personalidade', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="profissional">Profissional</SelectItem>
                                <SelectItem value="amigavel">Amigável</SelectItem>
                                <SelectItem value="formal">Formal</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="tecnico">Técnico</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Tom de Comunicação</Label>
                          <Select
                            value={formData.ia_tom}
                            onValueChange={(value) => handleInputChange('ia_tom', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="formal">Formal</SelectItem>
                              <SelectItem value="informal">Informal</SelectItem>
                              <SelectItem value="neutro">Neutro</SelectItem>
                              <SelectItem value="caloroso">Caloroso</SelectItem>
                              <SelectItem value="direto">Direto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Base de Conhecimento</Label>
                          <Textarea
                            value={formData.ia_conhecimento_base}
                            onChange={(e) => handleInputChange('ia_conhecimento_base', e.target.value)}
                            placeholder="Informações gerais sobre o negócio, especialidades, diferenciais..."
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Instruções Especiais</Label>
                          <Textarea
                            value={formData.ia_instrucoes_especiais}
                            onChange={(e) => handleInputChange('ia_instrucoes_especiais', e.target.value)}
                            placeholder="Instruções específicas sobre como a IA deve se comportar..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>FAQ - Perguntas Frequentes</Label>
                          <Textarea
                            value={formData.ia_faq}
                            onChange={(e) => handleInputChange('ia_faq', e.target.value)}
                            placeholder="P: Qual o horário de funcionamento? R: Funcionamos de segunda a sexta, das 8h às 18h..."
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Serviços Oferecidos</Label>
                          <Textarea
                            value={formData.ia_servicos}
                            onChange={(e) => handleInputChange('ia_servicos', e.target.value)}
                            placeholder="Lista detalhada dos serviços, procedimentos, tratamentos oferecidos..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Preços e Valores</Label>
                          <Textarea
                            value={formData.ia_precos}
                            onChange={(e) => handleInputChange('ia_precos', e.target.value)}
                            placeholder="Tabela de preços, valores de consultas, procedimentos, formas de pagamento..."
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Mensagens */}
          {erro && (
            <Alert variant="destructive">
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          {sucesso && (
            <Alert>
              <AlertDescription className="text-green-600">{sucesso}</AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex space-x-2">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={carregando}
            >
              {carregando ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Cadastrando...</span>
                </div>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Cadastrar Cliente
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
        </form>
      </CardContent>
    </Card>
  )
}

