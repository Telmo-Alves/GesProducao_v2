export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ClienteOption {
  codigo: number;
  nome: string;
  contactos?: string;
}

export interface ArtigoOption {
  codigo: number;
  descricao: string;
}

export interface ComposicaoOption {
  codigo: number;
  descricao: string;
}
