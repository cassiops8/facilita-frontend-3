import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'

export default function TrocarSenhaObrigatoria({ onSenhaTrocada, onLogout }) {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem. Digite novamente.')
      return
    }

    setCarregando(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nova_senha: novaSenha })
      })

      const data = await response.json()

      if (response.ok) {
        // Atualizar o usuário salvo para refletir senha_temporaria = false
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          user.senha_temporaria = false
          localStorage.setItem('user', JSON.stringify(user))
        }
        onSenhaTrocada && onSenhaTrocada()
      } else {
        setErro(data.error || data.erro || 'Erro ao trocar a senha.')
      }
    } catch (error) {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f0e8',
      padding: '1rem',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(196,164,107,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <ShieldCheck size={32} color="#C4A46B" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}>
            Crie sua nova senha
          </h1>
          <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.5 }}>
            Por segurança, você precisa definir uma senha pessoal antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#555', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
              Nova Senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                style={{
                  width: '100%',
                  padding: '11px 44px 11px 14px',
                  border: '1.5px solid #e8e0d0',
                  borderRadius: '8px',
                  background: '#fdfaf5',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex' }}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#555', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
              Confirmar Nova Senha
            </label>
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite a senha novamente"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1.5px solid #e8e0d0',
                borderRadius: '8px',
                background: '#fdfaf5',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          {erro && (
            <Alert variant="destructive" style={{ marginBottom: '1rem' }}>
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%',
              padding: '12px',
              background: '#C4A46B',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: carregando ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: carregando ? 0.7 : 1
            }}
          >
            <Lock size={17} />
            <span>{carregando ? 'Salvando...' : 'Salvar nova senha'}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '1rem',
              fontSize: '13px',
              color: '#C4A46B',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px'
            }}
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  )
}
