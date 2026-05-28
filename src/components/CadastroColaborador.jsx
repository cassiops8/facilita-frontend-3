import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserPlus, Plus } from 'lucide-react'

export default function CadastroColaborador({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    categoria_id: '',
    is_admin: false
  })
  const [categorias, setCategorias] = useState([])
  const [novaCategoria, setNovaCategoria] = useState('')
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const token = localStorage.getItem('token')
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categorias-colaborador`, {
        headers: authHeaders
      })
      const data = await response.json()
      setCategorias(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const criarCategoria = async () => {
    if (!novaCategoria.trim()) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categorias-colaborador`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          nome: novaCategoria,
          descricao: `Categoria ${novaCategoria}`
        })
      })

      if (response.ok) {
        const categoria = await response.json()
        setCategorias([...categorias, categoria])
        setFormData({ ...formData, categoria_id: categoria.id })
        setNovaCategoria('')
        setMostrarNovaCategoria(false)
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    setSucesso('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/funcionarias`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSucesso('Colaborador cadastrado com sucesso!')
        setTimeout(() => {
          onSuccess && onSuccess()
        }, 1500)
      } else {
        const errorData = await response.json()
        setErro(errorData.error || errorData.erro || 'Erro ao cadastrar colaborador')
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Cadastrar Novo Colaborador</span>
        </CardTitle>
        <CardDescription>
          Adicione uma nova funcionária ao sistema com categoria e permissões
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha *</Label>
            <Input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => handleInputChange('senha', e.target.value)}
              placeholder="Digite uma senha segura"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria do Colaborador</Label>
            <div className="flex space-x-2">
              <Select
                value={formData.categoria_id}
                onValueChange={(value) => handleInputChange('categoria_id', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Secretária</SelectItem>
                  <SelectItem value="2">SDR</SelectItem>
                  <SelectItem value="3">Vendedor</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id.toString()}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMostrarNovaCategoria(!mostrarNovaCategoria)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {mostrarNovaCategoria && (
              <div className="flex space-x-2 mt-2">
                <Input
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  placeholder="Nome da nova categoria"
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={criarCategoria}
                  disabled={!novaCategoria.trim()}
                >
                  Criar
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_admin"
              checked={formData.is_admin}
              onCheckedChange={(checked) => handleInputChange('is_admin', checked)}
            />
            <Label htmlFor="is_admin" className="text-sm font-medium">
              Conceder permissões de administrador
            </Label>
          </div>

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

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1" disabled={carregando}>
              {carregando ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Cadastrando...</span>
                </div>
              ) : (
                <><UserPlus className="h-4 w-4 mr-2" />Cadastrar Colaborador</>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
