import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight,
  Users,
  UserPlus,
  Building2,
  ArrowRightLeft,
  BarChart3,
  Settings,
  FileText,
  Home
} from 'lucide-react'

export default function Sidebar({ onMenuSelect, activeMenu }) {
  const [isMinimized, setIsMinimized] = useState(false)

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Visão geral do sistema'
    },
    {
      id: 'cadastrar-colaborador',
      label: 'Colaboradores',
      icon: Users,
      description: 'Gerenciar e cadastrar colaboradores'
    },
    {
      id: 'cadastrar-cliente',
      label: 'Cadastrar Cliente',
      icon: Building2,
      description: 'Adicionar novo cliente'
    },
    {
      id: 'mudar-cliente',
      label: 'Mudar Cliente de Colaborador',
      icon: ArrowRightLeft,
      description: 'Reatribuir clientes'
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: BarChart3,
      description: 'Análises e métricas'
    },
    {
      id: 'auditoria',
      label: 'Auditoria/Logs',
      icon: FileText,
      description: 'Registro de atividades'
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      description: 'Configurações do sistema'
    }
  ]

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <div className={`bg-card border-r border-border transition-all duration-300 ${
      isMinimized ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      {/* Header da Sidebar */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isMinimized && (
          <div>
            <h2 className="font-semibold text-foreground">Menu</h2>
            <p className="text-xs text-muted-foreground">Painel Administrativo</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="p-2"
        >
          {isMinimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeMenu === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full mb-2 ${
                isMinimized 
                  ? 'p-2 justify-center' 
                  : 'justify-start p-3 h-auto'
              } ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => onMenuSelect(item.id)}
              title={isMinimized ? item.label : ''}
            >
              <Icon className={`h-5 w-5 ${isMinimized ? '' : 'mr-3'}`} />
              {!isMinimized && (
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              )}
            </Button>
          )
        })}
      </div>

      {/* Footer da Sidebar */}
      {!isMinimized && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <div className="font-medium">Facilita AR</div>
            <div>Sistema de Gestão v2.0</div>
          </div>
        </div>
      )}
    </div>
  )
}
