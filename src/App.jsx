import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function App() {
  const [funcionaria, setFuncionaria] = useState(null)
  const [viewMode, setViewMode] = useState('normal')
  const [funcionariaVisualizando, setFuncionariaVisualizando] = useState(null)
  const [carregandoSessao, setCarregandoSessao] = useState(true)

  useEffect(() => {
    const verificarSessao = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/funcionarias/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          if (response.ok) {
            const funcionariaData = JSON.parse(userData)
            setFuncionaria(funcionariaData)
            if (funcionariaData.is_admin) setViewMode('admin')
          } else {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setCarregandoSessao(false)
    }
    verificarSessao()
  }, [])

  const handleLogin = (dadosFuncionaria) => {
    setFuncionaria(dadosFuncionaria)
    if (dadosFuncionaria.is_admin) setViewMode('admin')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setFuncionaria(null)
    setViewMode('normal')
    setFuncionariaVisualizando(null)
  }

  const handleViewFuncionaria = async (funcionariaId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/funcionarias/${funcionariaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const funcionariaData = await response.json()
      setFuncionariaVisualizando(funcionariaData)
      setViewMode('viewing')
    } catch (error) {
      console.error('Erro ao carregar funcionária:', error)
    }
  }

  const handleBackToAdmin = () => {
    setViewMode('admin')
    setFuncionariaVisualizando(null)
  }

  if (carregandoSessao) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg text-foreground">Carregando...</span>
        </div>
      </div>
    )
  }

  if (!funcionaria) return <Login onLogin={handleLogin} />

  if (viewMode === 'admin') {
    return (
      <AdminDashboard 
        funcionaria={funcionaria} 
        onLogout={handleLogout}
        onViewFuncionaria={handleViewFuncionaria}
      />
    )
  }

  if (viewMode === 'viewing' && funcionariaVisualizando) {
    return (
      <div>
        <div className="bg-primary/10 p-4 border-b border-border">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Visualizando: {funcionariaVisualizando.nome}</h2>
              <p className="text-sm text-muted-foreground">Modo administrador - Você pode interferir nas conversas</p>
            </div>
            <button onClick={handleBackToAdmin} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Voltar ao Painel Admin
            </button>
          </div>
        </div>
        <Dashboard funcionaria={funcionariaVisualizando} onLogout={handleBackToAdmin} isViewing={true} />
      </div>
    )
  }

  return <Dashboard funcionaria={funcionaria} onLogout={handleLogout} isViewing={false} />
}

export default App
