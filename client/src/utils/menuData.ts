import { MenuSection } from '../types';

export const menuSections: MenuSection[] = [
  {
    title: 'Tinturaria',
    items: [
      { label: 'Recepção', path: '/tinturaria/recepcao', icon: 'Package' },
      { label: 'Fichas Acabamento', path: '/tinturaria/fichas-acabamento', icon: 'Droplets' },
      { label: 'Processos', path: '/tinturaria/acabamento', icon: 'Scissors' },
      { label: 'Entregas', path: '/tinturaria/entregas', icon: 'Truck' },
      { label: 'Operações', path: '/tinturaria/operacoes', icon: 'Settings' },
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
      { label: 'Unidades Medida', path: '/tabelas/unidades', icon: 'Ruler' },
      { label: 'Secções', path: '/tabelas/seccoes', icon: 'Factory' },
      { label: 'Auxiliares', path: '/tabelas/auxiliares', icon: 'Flask' },
      { label: 'Corantes', path: '/tabelas/corantes', icon: 'TestTube' },
      { label: 'Cores', path: '/tabelas/cores', icon: 'Palette' },
      { label: 'Desenhos', path: '/tabelas/desenhos', icon: 'Image' },
      { label: 'Estados', path: '/tabelas/estados', icon: 'Flag' },
      { label: 'Máquinas', path: '/tabelas/maquinas', icon: 'Factory' },
      { label: 'Operações', path: '/tabelas/operacoes', icon: 'Wrench' },
      { label: 'Processos', path: '/tabelas/processos', icon: 'Workflow' },
      { label: 'Terminais', path: '/tabelas/terminais', icon: 'Computer' },
      { label: 'Utilizadores (BD)', path: '/tabelas/utilizadores', icon: 'User' },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Gestão Utilizadores', path: '/admin/utilizadores', icon: 'UserCog' },
      { label: 'Configurações', path: '/admin/configuracoes', icon: 'Cog' },
      { label: 'Reporting', path: '/admin/reporting', icon: 'FileText' },
      { label: 'Report Designer', path: '/admin/report-designer', icon: 'Palette' },
    ],
  },
];
