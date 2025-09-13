import { MenuSection } from '../types';

export const menuSections: MenuSection[] = [
  {
    title: 'Tinturaria',
    items: [
      { label: 'Recepção', path: '/tinturaria/recepcao', icon: 'Package' },
      { label: 'Tinturaria', path: '/tinturaria/producao', icon: 'Droplets' },
      { label: 'Acabamento', path: '/tinturaria/acabamento', icon: 'Scissors' },
      { label: 'Entregas', path: '/tinturaria/entregas', icon: 'Truck' },
      { label: 'Definições', path: '/tinturaria/definicoes', icon: 'Settings' },
    ],
  },
  {
    title: 'Laboratório',
    items: [
      { label: 'Registo Cores', path: '/laboratorio/cores', icon: 'Palette' },
      { label: 'Registo Receitas', path: '/laboratorio/receitas', icon: 'BookOpen' },
      { label: 'Tabela Clientes', path: '/laboratorio/clientes', icon: 'Users' },
      { label: 'Tabela Corantes', path: '/laboratorio/corantes', icon: 'TestTube' },
      { label: 'Tabela Auxiliares', path: '/laboratorio/auxiliares', icon: 'Flask' },
    ],
  },
  {
    title: 'Estamparia',
    items: [
      { label: 'Recepção', path: '/estamparia/recepcao', icon: 'Package' },
      { label: 'Tabela Desenhos', path: '/estamparia/desenhos', icon: 'Image' },
      { label: 'Concluídos', path: '/estamparia/concluidos', icon: 'CheckCircle' },
    ],
  },
  {
    title: 'Sincronizações',
    items: [
      { label: 'Sincronizar Clientes', path: '/sync/clientes', icon: 'RefreshCw' },
      { label: 'Sincronizar Auxiliares', path: '/sync/auxiliares', icon: 'RefreshCw' },
    ],
  },
  {
    title: 'Tabelas',
    items: [
      { label: 'Clientes', path: '/tabelas/clientes', icon: 'Users' },
      { label: 'Artigos', path: '/tabelas/artigos', icon: 'Package2' },
      { label: 'Composições', path: '/tabelas/composicoes', icon: 'Layers' },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Gestão Utilizadores', path: '/admin/utilizadores', icon: 'UserCog' },
      { label: 'Configurações', path: '/admin/configuracoes', icon: 'Cog' },
    ],
  },
];