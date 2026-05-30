import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  User,
  CalendarDays,
  CalendarRange,
  CalendarCheck
} from 'lucide-react'

export default function CalendarioAgenda({ funcionariaId, clientes = [] }) {
  const [visualizacao, setVisualizacao] = useState('semana') // dia, semana, mes
  const [dataAtual, setDataAtual] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null)
  const [novoAgendamento, setNovoAgendamento] = useState({
    cliente_id: '',
    titulo: '',
    descricao: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    tipo: 'consulta',
    status: 'agendado'
  })

  const tiposAgendamento = [
    { value: 'consulta', label: 'Consulta', color: 'bg-blue-500' },
    { value: 'procedimento', label: 'Procedimento', color: 'bg-green-500' },
    { value: 'retorno', label: 'Retorno', color: 'bg-yellow-500' },
    { value: 'avaliacao', label: 'Avaliação', color: 'bg-purple-500' },
    { value: 'emergencia', label: 'Emergência', color: 'bg-red-500' }
  ]

  const statusAgendamento = [
    { value: 'agendado', label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
    { value: 'confirmado', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
    { value: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'concluido', label: 'Concluído', color: 'bg-gray-100 text-gray-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  ]


  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  useEffect(() => {
    carregarAgendamentos()
  }, [funcionariaId, dataAtual])

  const carregarAgendamentos = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/agendamentos?funcionaria_id=${funcionariaId}`, { headers: getAuthHeaders() })
      const data = await response.json()
      setAgendamentos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    }
  }

  const formatarData = (data) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(data)
  }

  const formatarMesAno = (data) => {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).format(data)
  }

  const navegarData = (direcao) => {
    const novaData = new Date(dataAtual)
    
    if (visualizacao === 'dia') {
      novaData.setDate(novaData.getDate() + (direcao === 'proximo' ? 1 : -1))
    } else if (visualizacao === 'semana') {
      novaData.setDate(novaData.getDate() + (direcao === 'proximo' ? 7 : -7))
    } else if (visualizacao === 'mes') {
      novaData.setMonth(novaData.getMonth() + (direcao === 'proximo' ? 1 : -1))
    }
    
    setDataAtual(novaData)
  }

  const obterDiasSemana = () => {
    const inicioSemana = new Date(dataAtual)
    const dia = inicioSemana.getDay()
    const diff = inicioSemana.getDate() - dia
    inicioSemana.setDate(diff)

    const dias = []
    for (let i = 0; i < 7; i++) {
      const data = new Date(inicioSemana)
      data.setDate(inicioSemana.getDate() + i)
      dias.push(data)
    }
    return dias
  }

  const obterHorarios = () => {
    const horarios = []
    for (let hora = 8; hora <= 20; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`)
      horarios.push(`${hora.toString().padStart(2, '0')}:30`)
    }
    return horarios
  }

  const obterAgendamentosPorData = (data) => {
    const dataStr = data.toISOString().split('T')[0]
    return agendamentos.filter(ag => ag.data === dataStr)
  }

  const abrirModalNovoAgendamento = (data = null, hora = null) => {
    setNovoAgendamento({
      cliente_id: '',
      titulo: '',
      descricao: '',
      data: data ? data.toISOString().split('T')[0] : '',
      hora_inicio: hora || '',
      hora_fim: '',
      tipo: 'consulta',
      status: 'agendado'
    })
    setAgendamentoSelecionado(null)
    setModalAberto(true)
  }

  const editarAgendamento = (agendamento) => {
    setAgendamentoSelecionado(agendamento)
    setNovoAgendamento(agendamento)
    setModalAberto(true)
  }

  const salvarAgendamento = async () => {
    try {
      const url = agendamentoSelecionado 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/agendamentos/${agendamentoSelecionado.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/agendamentos`
      
      const method = agendamentoSelecionado ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...novoAgendamento,
          funcionaria_id: funcionariaId
        })
      })

      if (response.ok) {
        carregarAgendamentos()
        setModalAberto(false)
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error)
    }
  }

  const renderizarVisualizacaoDia = () => {
    const horarios = obterHorarios()
    const agendamentosHoje = obterAgendamentosPorData(dataAtual)

    return (
      <div className="space-y-2">
        <div className="text-center py-4">
          <h3 className="text-lg font-semibold">{formatarData(dataAtual)}</h3>
        </div>
        <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto">
          {horarios.map(horario => {
            const agendamento = agendamentosHoje.find(ag => ag.hora_inicio === horario)
            return (
              <div key={horario} className="flex items-center border-b border-gray-100 py-2">
                <div className="w-16 text-sm text-gray-500 font-mono">{horario}</div>
                <div className="flex-1 ml-4">
                  {agendamento ? (
                    <div 
                      className="p-2 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      style={{ backgroundColor: tiposAgendamento.find(t => t.value === agendamento.tipo)?.color + '20' }}
                      onClick={() => editarAgendamento(agendamento)}
                    >
                      <div className="font-medium">{agendamento.titulo}</div>
                      <div className="text-sm text-gray-600">{agendamento.cliente_nome}</div>
                      <Badge className={statusAgendamento.find(s => s.value === agendamento.status)?.color}>
                        {statusAgendamento.find(s => s.value === agendamento.status)?.label}
                      </Badge>
                    </div>
                  ) : (
                    <div 
                      className="h-8 border-2 border-dashed border-gray-200 rounded cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => abrirModalNovoAgendamento(dataAtual, horario)}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderizarVisualizacaoSemana = () => {
    const diasSemana = obterDiasSemana()
    const horarios = obterHorarios()
    const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <div className="space-y-2">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-8 gap-1">
          <div className="w-16"></div>
          {diasSemana.map((dia, index) => (
            <div key={index} className="text-center py-2 border-b">
              <div className="text-sm font-medium">{nomesDias[dia.getDay()]}</div>
              <div className="text-lg">{dia.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Grade de horários */}
        <div className="max-h-96 overflow-y-auto">
          {horarios.map(horario => (
            <div key={horario} className="grid grid-cols-8 gap-1 border-b border-gray-50">
              <div className="w-16 text-sm text-gray-500 font-mono py-2">{horario}</div>
              {diasSemana.map((dia, diaIndex) => {
                const agendamentosData = obterAgendamentosPorData(dia)
                const agendamento = agendamentosData.find(ag => ag.hora_inicio === horario)
                
                return (
                  <div key={diaIndex} className="min-h-12 p-1">
                    {agendamento ? (
                      <div 
                        className="p-1 rounded text-xs cursor-pointer hover:shadow-md transition-shadow"
                        style={{ backgroundColor: tiposAgendamento.find(t => t.value === agendamento.tipo)?.color + '20' }}
                        onClick={() => editarAgendamento(agendamento)}
                      >
                        <div className="font-medium truncate">{agendamento.titulo}</div>
                        <div className="text-gray-600 truncate">{agendamento.cliente_nome}</div>
                      </div>
                    ) : (
                      <div 
                        className="h-full border border-dashed border-gray-200 rounded cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => abrirModalNovoAgendamento(dia, horario)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderizarVisualizacaoMes = () => {
    const primeiroDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1)
    const ultimoDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0)
    const diasMes = []

    // Adicionar dias do mês anterior para completar a primeira semana
    const primeiroDiaSemana = primeiroDia.getDay()
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const dia = new Date(primeiroDia)
      dia.setDate(dia.getDate() - i - 1)
      diasMes.push({ data: dia, outroMes: true })
    }

    // Adicionar todos os dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      diasMes.push({ 
        data: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia), 
        outroMes: false 
      })
    }

    // Adicionar dias do próximo mês para completar a última semana
    const totalCelulas = Math.ceil(diasMes.length / 7) * 7
    const diasRestantes = totalCelulas - diasMes.length
    for (let i = 1; i <= diasRestantes; i++) {
      const dia = new Date(ultimoDia)
      dia.setDate(dia.getDate() + i)
      diasMes.push({ data: dia, outroMes: true })
    }

    const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <div className="space-y-2">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1">
          {nomesDias.map(nome => (
            <div key={nome} className="text-center py-2 font-medium text-gray-600">
              {nome}
            </div>
          ))}
        </div>

        {/* Grade do calendário */}
        <div className="grid grid-cols-7 gap-1">
          {diasMes.map((item, index) => {
            const agendamentosData = obterAgendamentosPorData(item.data)
            const isHoje = item.data.toDateString() === new Date().toDateString()
            
            return (
              <div 
                key={index} 
                className={`min-h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  item.outroMes ? 'bg-gray-50 text-gray-400' : 'bg-white'
                } ${isHoje ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => abrirModalNovoAgendamento(item.data)}
              >
                <div className={`text-sm font-medium ${isHoje ? 'text-blue-600' : ''}`}>
                  {item.data.getDate()}
                </div>
                <div className="space-y-1 mt-1">
                  {agendamentosData.slice(0, 3).map((agendamento, agIndex) => (
                    <div 
                      key={agIndex}
                      className="text-xs p-1 rounded truncate"
                      style={{ backgroundColor: tiposAgendamento.find(t => t.value === agendamento.tipo)?.color + '20' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        editarAgendamento(agendamento)
                      }}
                    >
                      {agendamento.hora_inicio} - {agendamento.titulo}
                    </div>
                  ))}
                  {agendamentosData.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{agendamentosData.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Agenda</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {/* Botões de visualização */}
            <div className="flex border rounded-lg">
              <Button
                variant={visualizacao === 'dia' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('dia')}
                className="rounded-r-none"
              >
                <CalendarCheck className="h-4 w-4 mr-1" />
                Dia
              </Button>
              <Button
                variant={visualizacao === 'semana' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('semana')}
                className="rounded-none border-x"
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                Semana
              </Button>
              <Button
                variant={visualizacao === 'mes' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('mes')}
                className="rounded-l-none"
              >
                <CalendarRange className="h-4 w-4 mr-1" />
                Mês
              </Button>
            </div>

            {/* Navegação */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navegarData('anterior')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium min-w-32 text-center">
                {visualizacao === 'mes' ? formatarMesAno(dataAtual) : formatarData(dataAtual)}
              </div>
              <Button variant="outline" size="sm" onClick={() => navegarData('proximo')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Botão novo agendamento */}
            <Button onClick={() => abrirModalNovoAgendamento()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {visualizacao === 'dia' && renderizarVisualizacaoDia()}
        {visualizacao === 'semana' && renderizarVisualizacaoSemana()}
        {visualizacao === 'mes' && renderizarVisualizacaoMes()}

        {/* Modal de agendamento */}
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {agendamentoSelecionado ? 'Editar Agendamento' : 'Novo Agendamento'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={novoAgendamento.cliente_id}
                  onValueChange={(value) => setNovoAgendamento({...novoAgendamento, cliente_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={novoAgendamento.titulo}
                  onChange={(e) => setNovoAgendamento({...novoAgendamento, titulo: e.target.value})}
                  placeholder="Ex: Consulta de rotina"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={novoAgendamento.data}
                    onChange={(e) => setNovoAgendamento({...novoAgendamento, data: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={novoAgendamento.tipo}
                    onValueChange={(value) => setNovoAgendamento({...novoAgendamento, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAgendamento.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora Início</Label>
                  <Input
                    type="time"
                    value={novoAgendamento.hora_inicio}
                    onChange={(e) => setNovoAgendamento({...novoAgendamento, hora_inicio: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora Fim</Label>
                  <Input
                    type="time"
                    value={novoAgendamento.hora_fim}
                    onChange={(e) => setNovoAgendamento({...novoAgendamento, hora_fim: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={novoAgendamento.status}
                  onValueChange={(value) => setNovoAgendamento({...novoAgendamento, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusAgendamento.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={novoAgendamento.descricao}
                  onChange={(e) => setNovoAgendamento({...novoAgendamento, descricao: e.target.value})}
                  placeholder="Detalhes do agendamento..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={salvarAgendamento} className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  {agendamentoSelecionado ? 'Atualizar' : 'Agendar'}
                </Button>
                <Button variant="outline" onClick={() => setModalAberto(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

