import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  Factory, 
  Users, 
  Package, 
  Droplets, 
  Palette, 
  Image,
  BarChart3,
  TrendingUp
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Recepções Hoje',
      value: '12',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Em Produção',
      value: '8',
      icon: Factory,
      color: 'bg-orange-500',
    },
    {
      title: 'Tinturaria',
      value: '5',
      icon: Droplets,
      color: 'bg-purple-500',
    },
    {
      title: 'Estamparia',
      value: '3',
      icon: Image,
      color: 'bg-green-500',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Nova recepção',
      details: 'Cliente ABC - 150kg algodão',
      time: '10:30',
      status: 'success'
    },
    {
      id: 2,
      action: 'Tinturaria iniciada',
      details: 'Lote T-001 - Cor Azul Royal',
      time: '09:15',
      status: 'info'
    },
    {
      id: 3,
      action: 'Estamparia concluída',
      details: 'Desenho EST-045 - 80 peças',
      time: '08:45',
      status: 'success'
    },
    {
      id: 4,
      action: 'Nova receita',
      details: 'Receita R-234 - Verde Militar',
      time: '08:20',
      status: 'info'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {user?.username}!
        </h1>
        <p className="text-gray-600">
          Visão geral do sistema de gestão de produção
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.details}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Package className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Nova Recepção</p>
                  <p className="text-xs text-gray-500">Registar nova entrada</p>
                </div>
              </button>
              
              <button className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Droplets className="h-5 w-5 mr-3 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Iniciar Tinturaria</p>
                  <p className="text-xs text-gray-500">Novo processo</p>
                </div>
              </button>
              
              <button className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Palette className="h-5 w-5 mr-3 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Nova Receita</p>
                  <p className="text-xs text-gray-500">Criar receita de cor</p>
                </div>
              </button>
              
              <button className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Image className="h-5 w-5 mr-3 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Novo Desenho</p>
                  <p className="text-xs text-gray-500">Registar desenho</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Info */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Utilizador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Utilizador</p>
                <p className="text-lg font-semibold">{user.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Papel</p>
                <p className="text-lg font-semibold capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Secção</p>
                <p className="text-lg font-semibold">{user.seccao}</p>
              </div>
              {user.isAdmin && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Privilégios</p>
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Administrador
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};