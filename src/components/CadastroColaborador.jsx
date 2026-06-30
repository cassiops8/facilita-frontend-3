import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserPlus, Camera, Save } from 'lucide-react'

export default function CadastroColaborador({ onSuccess, onCancel, colaboradorEditar = null }) {
  const editando = !!colaboradorEditar

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    categoria_id: '',
    is_admin: false,
    foto: ''
  })
  const [categorias, setCategorias] = useState([])
  const [categoriaOutros, setCategoriaOutros] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    carregarCategorias()
    if (colaboradorEditar) {
      setFormData({
        nome: colaboradorEditar.nome || '',
        email: colaboradorEditar.email || '',
        senha: '',
        telefone: colaboradorEditar.telefone || '',
        categoria_id: colaboradorEditar.categoria_id ? colaboradorEditar.categoria_id.toString() : '',
        is_admin: colaboradorEditar.is_admin || false,
        foto: colaboradorEditar.foto || ''
      })
    }
  }, [colaboradorEditar])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const carregarCategorias = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categorias-colaborador`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      setCategorias(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setErro('A foto deve ter no máximo 2MB. Escolha uma imagem menor.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setErro('Por favor, selecione um arquivo de imagem válido.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, foto: reader.result }))
      setErro('')
    }
    reader.readAsDataURL(file)
  }

  const resolverCategoriaId = async () => {
    // Se escolheu "Outros", cria a categoria nova e retorna o id dela
    if (formData.categoria_id === 'outros') {
      if (!categoriaOutros.trim()) {
        throw new Error('Digite o nome da categoria em "Outros".')
      }
      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categorias-colaborador`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nome: categoriaOutros.trim(),
          descricao: `Categoria ${categoriaOutros.trim()}`
        })
      })
      if (!resp.ok) {
        throw new Error('Não foi possível criar a categoria. Tente novamente.')
      }
      const cat = await resp.json()
      return cat.id
    }
    return formData.categoria_id ? parseInt(formData.categoria_id) : null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    setSucesso('')

    try {
      const categoriaIdResolvida = await resolverCategoriaId()

      const corpo = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        categoria_id: categoriaIdResolvida,
        is_admin: formData.is_admin,
        foto: formData.foto
      }

      if (formData.senha && formData.senha.trim()) {
        corpo.senha = formData.senha
      }

      let response
      if (editando) {
        response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/funcionarias/${colaboradorEditar.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(corpo)
        })
      } else {
        // Senha é opcional - se vazia, backend usa a padrão F1234567
        // (o colaborador troca no primeiro acesso)
        response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/funcionarias`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(corpo)
        })
      }

      if (response.ok) {
        setSucesso(editando ? 'Colaborador atualizado com sucesso!' : 'Colaborador cadastrado com sucesso!')
        setTimeout(() => {
          onSuccess && onSuccess()
        }, 1200)
      } else {
        const errorData = await response.json()
        setErro(errorData.error || errorData.erro || 'Erro ao salvar colaborador')
      }
    } catch (error) {
      setErro(error.message || 'Erro de conexão. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const iniciais = formData.nome
    ? formData.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {editando ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          <span>{editando ? 'Editar Colaborador' : 'Cadastrar Novo Colaborador'}</span>
        </CardTitle>
        <CardDescription>
          {editando
            ? 'Altere os dados do colaborador. Deixe a senha em branco para mantê-la.'
            : 'Adicione um novo colaborador ao sistema com categoria e permissões'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24">
              {formData.foto ? (
                <AvatarImage src={formData.foto} alt="Foto de perfil" />
              ) : null}
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {iniciais}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFotoChange}
              style={{ display: 'none' }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <Camera className="h-4 w-4 mr-2" />
              {formData.foto ? 'Trocar foto' : 'Adicionar foto'}
            </Button>
          </div>

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
            <Label htmlFor="senha">
              {editando ? 'Nova Senha (deixe em branco para manter)' : 'Senha (opcional)'}
            </Label>
            <Input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => handleInputChange('senha', e.target.value)}
              placeholder={editando ? 'Deixe em branco para não alterar' : 'Padrão: F1234567 (troca no 1º acesso)'}
            />
            {!editando && (
              <p className="text-xs text-muted-foreground">
                Se deixar em branco, a senha padrão será <strong>F1234567</strong>. O colaborador será obrigado a trocá-la no primeiro acesso.
              </p>
            )}
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
            <Select
              value={formData.categoria_id}
              onValueChange={(value) => handleInputChange('categoria_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Secretária</SelectItem>
                <SelectItem value="2">SDR</SelectItem>
                <SelectItem value="3">Vendedor</SelectItem>
                {categorias
                  .filter((categoria) => ![1, 2, 3].includes(categoria.id))
                  .map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id.toString()}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                <SelectItem value="outros">Outros (especificar)</SelectItem>
              </SelectContent>
            </Select>

            {formData.categoria_id === 'outros' && (
              <div className="mt-2">
                <Input
                  value={categoriaOutros}
                  onChange={(e) => setCategoriaOutros(e.target.value)}
                  placeholder="Digite o nome da categoria (ex: Gerente, Financeiro...)"
                />
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
                  <span>{editando ? 'Salvando...' : 'Cadastrando...'}</span>
                </div>
              ) : (
                <>
                  {editando ? <Save className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  {editando ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
                </>
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
