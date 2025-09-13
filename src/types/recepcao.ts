export interface MovRecepcao {
  seccao: number;
  data: Date;
  linha: number;
  cliente: number;
  nome: string;
  codigo: number;
  descricao: string;
  composicao: number;
  composicao_descricao: string;
  rolos: number;
  pesos: number;
  gramagem: number;
  medidas: number;
  branquear: 'S' | 'N';
  desencolar: 'S' | 'N';
  tingir: 'S' | 'N';
  rolos_entregues: number;
  pesos_entregues: number;
  requisicao?: string;
  utilizador: string;
  data_reg: Date;
}

export interface CreateMovRecepcaoRequest {
  seccao: number;
  data: Date;
  linha: number;
  cliente: number;
  nome: string;
  codigo: number;
  descricao: string;
  composicao: number;
  composicao_descricao: string;
  rolos: number;
  pesos: number;
  gramagem?: number;
  medidas?: number;
  branquear: 'S' | 'N';
  desencolar: 'S' | 'N';
  tingir: 'S' | 'N';
  rolos_entregues?: number;
  pesos_entregues?: number;
  requisicao?: string;
}

export interface UpdateMovRecepcaoRequest {
  data?: Date;
  cliente?: number;
  nome?: string;
  codigo?: number;
  descricao?: string;
  composicao?: number;
  composicao_descricao?: string;
  rolos?: number;
  pesos?: number;
  gramagem?: number;
  medidas?: number;
  branquear?: 'S' | 'N';
  desencolar?: 'S' | 'N';
  tingir?: 'S' | 'N';
  rolos_entregues?: number;
  pesos_entregues?: number;
  requisicao?: string;
}

export interface MovRecepcaoFilters {
  seccao?: number;
  dataInicio?: Date;
  dataFim?: Date;
  cliente?: number;
  nome?: string;
  codigo?: number;
  composicao?: number;
  branquear?: 'S' | 'N';
  desencolar?: 'S' | 'N';
  tingir?: 'S' | 'N';
  utilizador?: string;
  requisicao?: string;
  page?: number;
  limit?: number;
}

export interface MovRecepcaoListResponse {
  data: MovRecepcao[];
  total: number;
  page: number;
  totalPages: number;
}

// Interfaces para apoio (lookup tables)
export interface Cliente {
  codigo: number;
  nome: string;
}

export interface Artigo {
  codigo: number;
  descricao: string;
}

export interface Composicao {
  codigo: number;
  descricao: string;
}