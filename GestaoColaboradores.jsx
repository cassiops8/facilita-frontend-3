import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, UserPlus, Pencil, Shield } from 'lucide-react'
import CadastroColaborador from './CadastroColaborador'

export default function GestaoColaboradores({ onCancel }) {
  const [colaboradores, setColaboradores] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [colaboradorEditar, setColaboradorEditar] = useState(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const categoriaLabel = (id) => {
    const mapa = { 1: 'Secretária', 2: 'SDR', 3: 'Vendedor' }
    return mapa[id] || null
  }

  useEffect(() => {
    carregarColaboradores()
  }, [])

  const carregarColaboradores = async () => {
    setCarregando(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/funcionarias`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      setColaboradores(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error)
      setColaboradores([])
    } finally {
      setCarregando(false)
    }
  }

  const abrirNovo = () => {
    setColaboradorEditar(null)
    setModalAberto(true)
  }

  const abrirEditar = (colaborador) => {
    setColaboradorEditar(colaborador)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setColaboradorEditar(null)
  }

  const aoSalvar = () => {
    fecharModal()
    carregarColaboradores()
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Gestão de Colaboradores</span>
              </CardTitle>
              <CardDescription>Visualize, edite e cadastre colaboradores do sistema</CardDescription>
            </div>
            <Button onClick={abrirNovo}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {colaboradores.map((colab) => (
                <div key={colab.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      {colab.foto ? <AvatarImage src={colab.foto} alt={colab.nome} /> : null}
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {(colab.nome || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{colab.nome}</h4>
                      <p className="text-sm text-muted-foreground">{colab.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {categoriaLabel(colab.categoria_id) && (
                          <Badge variant="secondary">{categoriaLabel(colab.categoria_id)}</Badge>
                        )}
                        {colab.is_admin && (
                          <Badge variant="outline">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {colab.telefone || 'Sem telefone'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" onClick={() => abrirEditar(colab)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              ))}

              {colaboradores.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum colaborador cadastrado ainda</p>
                </div>
              )}
            </div>
          )}

          {onCancel && (
            <div className="mt-6">
              <Button variant="outline" onClick={onCancel}>
                Voltar ao Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <CadastroColaborador
              colaboradorEditar={colaboradorEditar}
              onSuccess={aoSalvar}
              onCancel={fecharModal}
            />
          </div>
        </div>
      )}
    </>
  )
}
