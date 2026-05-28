import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarRecuperacao, setMostrarRecuperacao] = useState(false)
  const [emailRecuperacao, setEmailRecuperacao] = useState('')
  const [carregandoRecuperacao, setCarregandoRecuperacao] = useState(false)
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.funcionaria))
        onLogin(data.funcionaria)
      } else {
        setErro(data.erro || 'Erro ao fazer login')
      }
    } catch (error) {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const handleRecuperarSenha = async (e) => {
    e.preventDefault()
    setCarregandoRecuperacao(true)
    setMensagemRecuperacao('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/recuperar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailRecuperacao }),
      })

      const data = await response.json()

      if (response.ok) {
        setMensagemRecuperacao(data.mensagem)
        setEmailRecuperacao('')
      } else {
        setMensagemRecuperacao(data.erro || 'Erro ao recuperar senha')
      }
    } catch (error) {
      setMensagemRecuperacao('Erro de conexão. Tente novamente.')
    } finally {
      setCarregandoRecuperacao(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #f5f0e8;
        }

        /* ── Painel esquerdo (marca) ── */
        .login-brand {
          flex: 1.1;
          background: #C4A46B;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          position: relative;
          overflow: hidden;
        }
        .login-brand::before {
          content: '';
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -80px;
          right: -80px;
        }
        .login-brand::after {
          content: '';
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: rgba(0,0,0,0.06);
          bottom: -60px;
          left: -60px;
        }
        .brand-content { position: relative; text-align: center; }
        .brand-dots {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .brand-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }
        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 58px;
          font-weight: 600;
          color: #fff;
          line-height: 1;
          letter-spacing: -1px;
        }
        .brand-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.8);
          letter-spacing: 5px;
          text-transform: uppercase;
          margin-top: 10px;
        }
        .brand-divider {
          width: 40px;
          height: 1px;
          background: rgba(255,255,255,0.4);
          margin: 2rem auto;
        }
        .brand-tagline {
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          max-width: 200px;
          margin: 0 auto;
        }

        /* ── Painel direito (formulário) ── */
        .login-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          background: #fff;
        }
        .login-form-box { width: 100%; max-width: 360px; }

        .form-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.75rem;
        }
        .form-eyebrow-line {
          width: 32px;
          height: 3px;
          background: #C4A46B;
          border-radius: 2px;
        }
        .form-eyebrow-text {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #C4A46B;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 6px;
        }
        .form-subtitle {
          font-size: 14px;
          color: #888;
          margin-bottom: 2rem;
        }

        .field-group { margin-bottom: 1.25rem; }
        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #555;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e8e0d0;
          border-radius: 8px;
          background: #fdfaf5;
          color: #1a1a1a;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .field-input:focus {
          border-color: #C4A46B;
          box-shadow: 0 0 0 3px rgba(196,164,107,0.15);
          background: #fff;
        }
        .field-input::placeholder { color: #bbb; }
        .password-wrapper { position: relative; }
        .password-wrapper .field-input { padding-right: 44px; }
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #aaa;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .password-toggle:hover { color: #C4A46B; }

        .btn-entrar {
          width: 100%;
          padding: 12px;
          background: #C4A46B;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 1.75rem;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.3px;
        }
        .btn-entrar:hover:not(:disabled) { background: #b8955a; }
        .btn-entrar:active:not(:disabled) { transform: scale(0.98); }
        .btn-entrar:disabled { opacity: 0.7; cursor: not-allowed; }

        .btn-forgot {
          display: block;
          width: 100%;
          text-align: center;
          margin-top: 1rem;
          font-size: 13px;
          color: #C4A46B;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .btn-forgot:hover { color: #b8955a; }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Modal recuperação de senha ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 50;
        }
        .modal-card {
          background: #fff;
          border-radius: 14px;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 6px;
        }
        .modal-subtitle {
          font-size: 13px;
          color: #888;
          margin-bottom: 1.5rem;
        }
        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 1.25rem;
        }
        .btn-outline {
          flex: 1;
          padding: 10px;
          background: transparent;
          border: 1.5px solid #e0d5c5;
          border-radius: 8px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          color: #555;
          transition: background 0.2s;
        }
        .btn-outline:hover { background: #fdfaf5; }

        /* ── Responsivo (mobile) ── */
        @media (max-width: 640px) {
          .login-brand { display: none; }
          .login-form-panel { padding: 2rem 1.5rem; }
          .login-root { background: #fff; }
        }
      `}</style>

      <div className="login-root">

        {/* Painel esquerdo — Marca */}
        <div className="login-brand">
          <div className="brand-content">
            <div className="brand-dots">
              <div className="brand-dot" style={{ background: '#fff' }} />
              <div className="brand-dot" style={{ background: '#7A3030' }} />
              <div className="brand-dot" style={{ background: '#4A1C1C' }} />
            </div>
            <div className="brand-name">Facilita</div>
            <div className="brand-sub">Assistentes Remotos</div>
            <div className="brand-divider" />
            <p className="brand-tagline">
              Gerencie sua equipe com agilidade e controle total
            </p>
          </div>
        </div>

        {/* Painel direito — Formulário */}
        <div className="login-form-panel">
          <div className="login-form-box">

            <div className="form-eyebrow">
              <div className="form-eyebrow-line" />
              <span className="form-eyebrow-text">Sistema de gestão</span>
            </div>

            <h1 className="form-title">Bem-vindo de volta</h1>
            <p className="form-subtitle">Faça login para acessar o painel de controle</p>

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label" htmlFor="email">E-mail</label>
                <input
                  id="email"
                  className="field-input"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="senha">Senha</label>
                <div className="password-wrapper">
                  <input
                    id="senha"
                    className="field-input"
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {erro && (
                <Alert variant="destructive" style={{ marginTop: '0.75rem' }}>
                  <AlertDescription>{erro}</AlertDescription>
                </Alert>
              )}

              <button type="submit" className="btn-entrar" disabled={carregando}>
                {carregando ? (
                  <><div className="spinner" /><span>Entrando...</span></>
                ) : (
                  <><LogIn size={17} /><span>Entrar</span></>
                )}
              </button>

              <button
                type="button"
                className="btn-forgot"
                onClick={() => setMostrarRecuperacao(true)}
              >
                Esqueceu sua senha?
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal — Recuperação de Senha */}
      {mostrarRecuperacao && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="modal-title">Recuperar senha</h2>
            <p className="modal-subtitle">
              Digite seu e-mail para receber as instruções de recuperação
            </p>

            <form onSubmit={handleRecuperarSenha}>
              <div className="field-group">
                <label className="field-label" htmlFor="emailRecuperacao">E-mail</label>
                <input
                  id="emailRecuperacao"
                  className="field-input"
                  type="email"
                  placeholder="seu@email.com"
                  value={emailRecuperacao}
                  onChange={(e) => setEmailRecuperacao(e.target.value)}
                  required
                />
              </div>

              {mensagemRecuperacao && (
                <Alert style={{ marginTop: '0.5rem' }}>
                  <AlertDescription>{mensagemRecuperacao}</AlertDescription>
                </Alert>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn-entrar" style={{ marginTop: 0 }} disabled={carregandoRecuperacao}>
                  {carregandoRecuperacao ? (
                    <><div className="spinner" /><span>Enviando...</span></>
                  ) : 'Enviar'}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setMostrarRecuperacao(false)
                    setEmailRecuperacao('')
                    setMensagemRecuperacao('')
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
