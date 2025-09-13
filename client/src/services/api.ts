import axios, { AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, User, CreateUserRequest, UpdateUserRequest, ApiResponse, AppConfig } from '../types';
import { PagedResult, ClienteOption, ArtigoOption, ComposicaoOption, UnidadeMedidaOption, SeccaoOption } from '../types/tabelas';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AxiosResponse<ApiResponse<LoginResponse>>> => {
    return api.post('/auth/login', credentials);
  },

  validateToken: async (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> => {
    return api.get('/auth/validate');
  },
};

// Users API
export const usersApi = {
  getAllUsers: async (): Promise<AxiosResponse<ApiResponse<User[]>>> => {
    return api.get('/users');
  },

  getUserById: async (id: string): Promise<AxiosResponse<ApiResponse<User>>> => {
    return api.get(`/users/${id}`);
  },

  createUser: async (userData: CreateUserRequest): Promise<AxiosResponse<ApiResponse<User>>> => {
    return api.post('/users', userData);
  },

  updateUser: async (id: string, userData: UpdateUserRequest): Promise<AxiosResponse<ApiResponse<User>>> => {
    return api.put(`/users/${id}`, userData);
  },

  deleteUser: async (id: string): Promise<AxiosResponse<ApiResponse>> => {
    return api.delete(`/users/${id}`);
  },
};

// Config API
export const configApi = {
  getConfig: async (): Promise<AxiosResponse<ApiResponse<AppConfig>>> => {
    return api.get('/config');
  },

  updateConfig: async (configData: Partial<AppConfig>): Promise<AxiosResponse<ApiResponse<AppConfig>>> => {
    return api.put('/config', configData);
  },

  testConnection: async (database: 'producao' | 'gescom'): Promise<AxiosResponse<ApiResponse<{ database: string; connected: boolean }>>> => {
    return api.get(`/config/test/${database}`);
  },

  testAllConnections: async (): Promise<AxiosResponse<ApiResponse<{ producao: boolean; gescom: boolean }>>> => {
    return api.get('/config/test');
  },

  reloadConfig: async (): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/config/reload');
  },
};

export default api;

// Tabelas API
export const tabelasApi = {
  // Clientes
  listClientes: async (params: { page?: number; limit?: number; search?: string } = {}): Promise<AxiosResponse<ApiResponse<PagedResult<ClienteOption>>>> => {
    return api.get('/tabelas/clientes', { params });
  },
  getCliente: async (codigo: number): Promise<AxiosResponse<ApiResponse<ClienteOption>>> => {
    return api.get(`/tabelas/clientes/${codigo}`);
  },
  createCliente: async (data: { codigo: number; nome: string; contactos?: string; situacao?: string }): Promise<AxiosResponse<ApiResponse<ClienteOption>>> => {
    return api.post('/tabelas/clientes', data);
  },
  updateCliente: async (codigo: number, data: { nome?: string; contactos?: string; situacao?: string }): Promise<AxiosResponse<ApiResponse<ClienteOption>>> => {
    return api.put(`/tabelas/clientes/${codigo}`, data);
  },
  deleteCliente: async (codigo: number): Promise<AxiosResponse<ApiResponse>> => {
    return api.delete(`/tabelas/clientes/${codigo}`);
  },

  // Artigos
  listArtigos: async (params: { page?: number; limit?: number; search?: string } = {}): Promise<AxiosResponse<ApiResponse<PagedResult<ArtigoOption>>>> => {
    return api.get('/tabelas/artigos', { params });
  },
  getArtigo: async (codigo: number): Promise<AxiosResponse<ApiResponse<ArtigoOption>>> => {
    return api.get(`/tabelas/artigos/${codigo}`);
  },
  createArtigo: async (data: { codigo: number; descricao: string; un_medida?: string; situacao?: string; seccao?: number }): Promise<AxiosResponse<ApiResponse<ArtigoOption>>> => {
    return api.post('/tabelas/artigos', data);
  },
  updateArtigo: async (codigo: number, data: { descricao?: string; un_medida?: string; situacao?: string; seccao?: number }): Promise<AxiosResponse<ApiResponse<ArtigoOption>>> => {
    return api.put(`/tabelas/artigos/${codigo}`, data);
  },
  deleteArtigo: async (codigo: number): Promise<AxiosResponse<ApiResponse>> => {
    return api.delete(`/tabelas/artigos/${codigo}`);
  },

  // Composições
  listComposicoes: async (params: { page?: number; limit?: number; search?: string } = {}): Promise<AxiosResponse<ApiResponse<PagedResult<ComposicaoOption>>>> => {
    return api.get('/tabelas/composicoes', { params });
  },
  getComposicao: async (codigo: number): Promise<AxiosResponse<ApiResponse<ComposicaoOption>>> => {
    return api.get(`/tabelas/composicoes/${codigo}`);
  },
  createComposicao: async (data: { codigo: number; descricao: string; situacao?: string }): Promise<AxiosResponse<ApiResponse<ComposicaoOption>>> => {
    return api.post('/tabelas/composicoes', data);
  },
  updateComposicao: async (codigo: number, data: { descricao?: string; situacao?: string }): Promise<AxiosResponse<ApiResponse<ComposicaoOption>>> => {
    return api.put(`/tabelas/composicoes/${codigo}`, data);
  },
  deleteComposicao: async (codigo: number): Promise<AxiosResponse<ApiResponse>> => {
    return api.delete(`/tabelas/composicoes/${codigo}`);
  },
  
  // Unidades de Medida
  listUnidades: async (params: { page?: number; limit?: number; search?: string } = {}): Promise<AxiosResponse<ApiResponse<PagedResult<UnidadeMedidaOption>>>> => {
    return api.get('/tabelas/unidades', { params });
  },
  getUnidade: async (un_medida: string): Promise<AxiosResponse<ApiResponse<UnidadeMedidaOption>>> => {
    return api.get(`/tabelas/unidades/${encodeURIComponent(un_medida)}`);
  },
  createUnidade: async (data: { un_medida: string; descricao: string; medida?: number }): Promise<AxiosResponse<ApiResponse<UnidadeMedidaOption>>> => {
    return api.post('/tabelas/unidades', data);
  },
  updateUnidade: async (un_medida: string, data: { descricao?: string; medida?: number }): Promise<AxiosResponse<ApiResponse<UnidadeMedidaOption>>> => {
    return api.put(`/tabelas/unidades/${encodeURIComponent(un_medida)}`, data);
  },
  deleteUnidade: async (un_medida: string): Promise<AxiosResponse<ApiResponse>> => {
    return api.delete(`/tabelas/unidades/${encodeURIComponent(un_medida)}`);
  },

  // Secções
  listSeccoes: async (params: { page?: number; limit?: number; search?: string } = {}): Promise<AxiosResponse<ApiResponse<PagedResult<SeccaoOption>>>> => {
    return api.get('/tabelas/seccoes', { params });
  },
  getSeccao: async (seccao: number): Promise<AxiosResponse<ApiResponse<SeccaoOption>>> => {
    return api.get(`/tabelas/seccoes/${seccao}`);
  },
  createSeccao: async (data: { seccao: number; descricao: string; ordem?: number; situacao?: string }): Promise<AxiosResponse<ApiResponse<SeccaoOption>>> => {
    return api.post('/tabelas/seccoes', data);
  },
  updateSeccao: async (seccao: number, data: { descricao?: string; ordem?: number; situacao?: string }): Promise<AxiosResponse<ApiResponse<SeccaoOption>>> => {
    return api.put(`/tabelas/seccoes/${seccao}`, data);
  },
  deleteSeccao: async (seccao: number): Promise<AxiosResponse<ApiResponse>> => {
    return api.delete(`/tabelas/seccoes/${seccao}`);
  },

  // Auxiliares
  listAuxiliares: async (params: { page?: number; limit?: number; search?: string } = {}) => api.get('/tabelas/auxiliares', { params }),
  getAuxiliar: async (auxiliar: string) => api.get(`/tabelas/auxiliares/${encodeURIComponent(auxiliar)}`),
  createAuxiliar: async (data: { auxiliar: string; descricao: string; situacao?: string }) => api.post('/tabelas/auxiliares', data),
  updateAuxiliar: async (auxiliar: string, data: { descricao?: string; situacao?: string }) => api.put(`/tabelas/auxiliares/${encodeURIComponent(auxiliar)}`, data),
  deleteAuxiliar: async (auxiliar: string) => api.delete(`/tabelas/auxiliares/${encodeURIComponent(auxiliar)}`),

  // Corantes
  listCorantes: async (params: { page?: number; limit?: number; search?: string } = {}) => api.get('/tabelas/corantes', { params }),
  getCorante: async (corante: string) => api.get(`/tabelas/corantes/${encodeURIComponent(corante)}`),
  createCorante: async (data: { corante: string; descricao: string; ref_forn?: string; situacao?: string; classificacao?: string }) => api.post('/tabelas/corantes', data),
  updateCorante: async (corante: string, data: { descricao?: string; ref_forn?: string; situacao?: string; classificacao?: string }) => api.put(`/tabelas/corantes/${encodeURIComponent(corante)}`, data),
  deleteCorante: async (corante: string) => api.delete(`/tabelas/corantes/${encodeURIComponent(corante)}`),

  // Cores
  listCores: async (params: { page?: number; limit?: number; search?: string } = {}) => api.get('/tabelas/cores', { params }),
  getCor: async (id: number) => api.get(`/tabelas/cores/${id}`),
  createCor: async (data: { id: number; codigo_cor: string; malha?: string; pcusto?: number; situacao?: string; classificacao?: string }) => api.post('/tabelas/cores', data),
  updateCor: async (id: number, data: { codigo_cor?: string; malha?: string; pcusto?: number; situacao?: string; classificacao?: string }) => api.put(`/tabelas/cores/${id}`, data),
  deleteCor: async (id: number) => api.delete(`/tabelas/cores/${id}`),

  // Desenhos
  listDesenhos: async (params: { page?: number; limit?: number; search?: string } = {}) => api.get('/tabelas/desenhos', { params }),
  getDesenho: async (desenho: number) => api.get(`/tabelas/desenhos/${desenho}`),
  createDesenho: async (data: { desenho: number; descricao: string; cliente?: number }) => api.post('/tabelas/desenhos', data),
  updateDesenho: async (desenho: number, data: { descricao?: string; cliente?: number }) => api.put(`/tabelas/desenhos/${desenho}`, data),
  deleteDesenho: async (desenho: number) => api.delete(`/tabelas/desenhos/${desenho}`),

  // Estados
  listEstados: async (params: { page?: number; limit?: number; search?: string } = {}) => api.get('/tabelas/estados', { params }),
  getEstado: async (id: number) => api.get(`/tabelas/estados/${id}`),
  createEstado: async (data: { id: number; descricao: string; movimenta?: any; situacao?: string }) => api.post('/tabelas/estados', data),
  updateEstado: async (id: number, data: { descricao?: string; movimenta?: any; situacao?: string }) => api.put(`/tabelas/estados/${id}`, data),
  deleteEstado: async (id: number) => api.delete(`/tabelas/estados/${id}`),

  // Maquinas
  listMaquinas: async (params: { page?: number; limit?: number; search?: string } = {}) => api.get('/tabelas/maquinas', { params }),
  getMaquina: async (maquina: number) => api.get(`/tabelas/maquinas/${maquina}`),
  createMaquina: async (data: { maquina: number; descricao: string; observacoes?: string; situacao?: string; seccao?: number; ordem?: number }) => api.post('/tabelas/maquinas', data),
  updateMaquina: async (maquina: number, data: { descricao?: string; observacoes?: string; situacao?: string; seccao?: number; ordem?: number }) => api.put(`/tabelas/maquinas/${maquina}`, data),
  deleteMaquina: async (maquina: number) => api.delete(`/tabelas/maquinas/${maquina}`),

  // Operacoes
  listOperacoes: async (params: { page?: number; limit?: number; search?: string } = {}) => api.get('/tabelas/operacoes', { params }),
  getOperacao: async (operacao: number) => api.get(`/tabelas/operacoes/${operacao}`),
  createOperacao: async (data: { operacao: number; descricao: string }) => api.post('/tabelas/operacoes', data),
  updateOperacao: async (operacao: number, data: { descricao?: string }) => api.put(`/tabelas/operacoes/${operacao}`, data),
  deleteOperacao: async (operacao: number) => api.delete(`/tabelas/operacoes/${operacao}`),

  // Processos
  listProcessos: async (params: { page?: number; limit?: number; search?: string } = {}) => api.get('/tabelas/processos', { params }),
  getProcesso: async (id: number) => api.get(`/tabelas/processos/${id}`),
  createProcesso: async (data: { id: number; descricao: string; ordem?: number; id_pai?: number; situacao?: string }) => api.post('/tabelas/processos', data),
  updateProcesso: async (id: number, data: { descricao?: string; ordem?: number; id_pai?: number; situacao?: string }) => api.put(`/tabelas/processos/${id}`, data),
  deleteProcesso: async (id: number) => api.delete(`/tabelas/processos/${id}`),

  // Terminais
  listTerminais: async (params: { page?: number; limit?: number; search?: string } = {}) => api.get('/tabelas/terminais', { params }),
  getTerminal: async (terminal: string) => api.get(`/tabelas/terminais/${encodeURIComponent(terminal)}`),
  createTerminal: async (data: { terminal: string; maquina?: number }) => api.post('/tabelas/terminais', data),
  updateTerminal: async (terminal: string, data: { maquina?: number }) => api.put(`/tabelas/terminais/${encodeURIComponent(terminal)}`, data),
  deleteTerminal: async (terminal: string) => api.delete(`/tabelas/terminais/${encodeURIComponent(terminal)}`),

  // Utilizadores (Firebird)
  listUtilizadores: async (params: { page?: number; limit?: number; search?: string } = {}) => api.get('/tabelas/utilizadores-sis', { params }),
  getUtilizador: async (utilizador: string) => api.get(`/tabelas/utilizadores-sis/${encodeURIComponent(utilizador)}`),
  createUtilizador: async (data: { utilizador: string; senha: string; nivel?: number; seccao?: number; administrador?: any }) => api.post('/tabelas/utilizadores-sis', data),
  updateUtilizador: async (utilizador: string, data: { senha?: string; nivel?: number; seccao?: number; administrador?: any }) => api.put(`/tabelas/utilizadores-sis/${encodeURIComponent(utilizador)}`, data),
  deleteUtilizador: async (utilizador: string) => api.delete(`/tabelas/utilizadores-sis/${encodeURIComponent(utilizador)}`),
};

// Reports API
export const reportsApi = {
  listTemplates: async () => api.get('/reports/templates'),
  getTemplate: async (templateId: string) => api.get(`/reports/templates/${encodeURIComponent(templateId)}`),
  saveTemplate: async (template: any) => api.put('/reports/templates', template),
  createTemplate: async (payload: { name: string; description?: string }) => api.post('/reports/templates', payload),
};
