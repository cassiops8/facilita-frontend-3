// Utilitário para fazer requisições autenticadas com JWT
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`

// Função para fazer requisições autenticadas
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    // Se o token expirou, redirecionar para login
    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.reload()
      return null
    }
    
    return response
  } catch (error) {
    console.error('Erro na requisição:', error)
    throw error
  }
}

// Funções específicas para diferentes tipos de requisição
export const apiGet = (endpoint) => apiRequest(endpoint)

export const apiPost = (endpoint, data) => 
  apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const apiPut = (endpoint, data) => 
  apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const apiDelete = (endpoint) => 
  apiRequest(endpoint, {
    method: 'DELETE',
  })

// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  return !!token
}

// Função para obter dados do usuário logado
export const getCurrentUser = () => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
}

// Função para fazer logout
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.reload()
}

