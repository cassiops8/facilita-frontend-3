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
      cons
