import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, Bell, Settings, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { tabelasApi } from '../../services/api';
import { SeccaoOption, PagedResult } from '../../types/tabelas';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [seccaoDesc, setSeccaoDesc] = useState<string>('');

  useEffect(() => {
    const loadSeccao = async () => {
      try {
        if (user?.seccao) {
          const resp = await tabelasApi.getSeccao(user.seccao);
          if (resp.data.success && resp.data.data) {
            setSeccaoDesc(resp.data.data.descricao || '');
          }
        } else {
          setSeccaoDesc('');
        }
      } catch {
        setSeccaoDesc('');
      }
    };
    loadSeccao();
  }, [user?.seccao]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Sistema de Gestão de Produção
            </h1>
            <div className="mt-1">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium shadow-sm">
                <MapPin className="h-4 w-4" />
                Secção: <span className="font-semibold">{user?.seccao || 1}</span>
                {seccaoDesc && (<span className="text-blue-600">— {seccaoDesc}</span>)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/configuracoes')}
          >
            <Settings className="h-5 w-5" />
          </Button>

          <div className="ml-4 flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
